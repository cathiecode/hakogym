import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getPendingCarQueueAddress } from "../../api";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { ReadAllReply } from "../../types/proto/running_observer";
import { RunningObserverClient } from "../../types/proto/running_observer.client";
import { useCallback } from "react";
import { packMetaData, parseMetaData } from "../meta/types";
import { ParsedMetaData } from "../meta/types";
import toast from "react-hot-toast";

const client = () =>
  new RunningObserverClient(
    new GrpcWebFetchTransport({ baseUrl: getPendingCarQueueAddress() })
  );

export const useRunnningObserverState = () => {
  const swr = useSWRSubscription(
    ["running_observer", "useList"],
    (_, { next }: SWRSubscriptionOptions<ReadAllReply, unknown>) => {
      const abort = new AbortController();
      const connection = client().subscribeChange({}, { abort: abort.signal });

      const reload = () =>
        client()
          .readAll({})
          .response.then((result) => next(null, result))
          .catch((e) => next(e));

      reload();

      (async () => {
        try {
          for await (const _ of connection.responses) {
            reload();
          }

          await connection;
        } catch (e) {
          if (abort.signal.aborted) {
            return;
          }
          toast.error("RPC Disconnected: Running");
          console.error("rpc", e);
          next(e);
        }
      })();

      return () => {
        abort.abort("unsubscribe");
      };
    }
  );

  const forceStart = useCallback(
    async () =>
      await client().start({
        timestamp: BigInt(Date.now()),
      }),
    []
  );

  const forceStop = useCallback(
    async (id?: string) =>
      await client().stop({
        id: id ? { value: id } : undefined,
        timestamp: BigInt(Date.now()),
      }),
    []
  );

  const updateMetadata = useCallback(async (id: string, meta: string) => {
    await client().updateMetadata({
      timestamp: BigInt(Date.now()),
      id: id,
      metadata: meta,
    });
  }, []);

  const getMetaData = useCallback(async (id: string) => {
    const item = (await client().readAll({})).response.item.find(
      (item) => item.id === id
    );

    if (!item) {
      throw "アイテムが見つかりませんでした";
    }

    const metaData = parseMetaData(item.meta);

    return metaData;
  }, []);

  const changeMetaData = useCallback(
    async (
      id: string,
      setter: (metaData: ParsedMetaData) => ParsedMetaData
    ) => {
      const metaData = await getMetaData(id);
      await updateMetadata(id, packMetaData(setter(metaData)));
    },
    [getMetaData, updateMetadata]
  );

  const dnf = useCallback(
    async (id: string) => {
      await changeMetaData(id, (metadata) => ({ ...metadata, status: "DNF" }));
      await forceStop(id);
    },
    [changeMetaData, forceStop]
  );

  const offsetPylonTouchCount = useCallback(
    async (id: string, offset: number) => {
      await changeMetaData(id, (meta) => ({
        ...meta,
        pylonTouchCount: meta.pylonTouchCount + offset,
      }));
    },
    [changeMetaData]
  );

  const offsetDerailmentCount = useCallback(
    async (id: string, offset: number) => {
      await changeMetaData(id, (meta) => ({
        ...meta,
        derailmentCount: meta.derailmentCount + offset,
      }));
    },
    [changeMetaData]
  );

  return {
    forceStart,
    forceStop,
    dnf,
    offsetPylonTouchCount,
    offsetDerailmentCount,
    updateMetadata,
    ...swr,
  };
};
