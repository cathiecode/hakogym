import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getPendingCarQueueAddress } from "../../api";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";

import { PendingCarQueueClient } from "../../types/proto/pending_car_queue.client";
import { useCallback } from "react";
import {
  InsertedItem,
  Item,
  ReadAllReply,
} from "../../types/proto/pending_car_queue";
import toast from "react-hot-toast";

const client = () =>
  new PendingCarQueueClient(
    new GrpcWebFetchTransport({ baseUrl: getPendingCarQueueAddress() })
  );

export const useList = () => {
  const swr = useSWRSubscription(
    ["pending_car_queue", "useList"],
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
          toast.error("RPC Disconnected: Queue");
          console.error("rpc", e);
          next(e);
        }
      })();

      return () => {
        abort.abort();
      };
    }
  );

  const insert = useCallback(
    async (item: Item, position: number | undefined = undefined) => {
      await client().insert({
        item,
        position: position !== undefined ? { value: position } : undefined,
      }).response;
    },
    []
  );

  const update = useCallback(async (item: InsertedItem) => {
    await client().update({
      item,
    }).response;
  }, []);

  const remove = useCallback(async (id: string) => {
    await client().remove({ id }).response;
    //swr.mutate();
  }, []);

  const removeAll = useCallback(async () => {
    await client().removeAll({}).response;
  }, []);

  return {
    ...swr,
    insert,
    remove,
    update,
    removeAll,
  };
};
