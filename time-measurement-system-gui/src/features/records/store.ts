import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { RecordsClient } from "../../types/proto/records.client";
import { getRecordsAddress, pooledSubscribeAggrigatedChange } from "../../api";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { ReadAllReply } from "../../types/proto/records";
import { useCallback } from "react";
import toast from "react-hot-toast";

const client = () =>
  new RecordsClient(
    new GrpcWebFetchTransport({ baseUrl: getRecordsAddress() })
  );

export default function useRecords() {
  const swr = useSWRSubscription(
    ["records", "useList"],
    (_, { next }: SWRSubscriptionOptions<ReadAllReply, unknown>) => {
      const reload = () =>
        client()
          .readAll({})
          .response.then((result) => next(null, result))
          .catch((e) => next(e, undefined));

      reload();

      const unsubscribe = pooledSubscribeAggrigatedChange(
        () => {
          reload();
        },
        (e) => {
          toast.error("RPC Disconnected: Records");
          console.error("rpc", e);
          next(e);
        }
      );

      reload();

      return () => {
        unsubscribe();
      };
    }
  );

  const updateMetadata = useCallback(async (id: string, meta: string) => {
    const oldItem = (await client().readAll({}).response).item.find(
      (item) => item.id === id
    );

    if (!oldItem) {
      throw new Error(`Failed to read old item ${id}`);
    }

    await client().update({
      item: {
        id,
        meta,
        time: oldItem.time,
      },
    });
  }, []);

  const remove = useCallback(async (id: string) => {
    await client().remove({ id });
  }, []);

  return { updateMetadata, remove, ...swr };
}
