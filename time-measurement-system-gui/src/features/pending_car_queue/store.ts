import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getPendingCarQueueAddress } from "../../api";
import useSWRSubscription, {
  SWRSubscriptionOptions,
} from "swr/subscription";

import { PendingCarQueueClient } from "../../types/proto/pending_car_queue.client";
import { useCallback } from "react";
import { InsertedItem, ReadAllReply } from "../../types/proto/pending_car_queue";
import { ParsedMetaData, packMetaData } from "../meta/types";

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

      connection.responses.onMessage(reload);

      connection.responses.onError((e) => {
        next(e);
      });

      reload();

      return () => {
        abort.abort();
      };
    }
  );

  const insert = useCallback(
    async (meta: ParsedMetaData, position: number | undefined = undefined) => {
      await client().insert({
        item: { meta: packMetaData(meta) },
        position: position !== undefined ? { value: position } : undefined,
      }).response;
    },
    []
  );

  const update = useCallback(async (item: InsertedItem) => {
    await client().update({
      item,
    }).response;
  }, [])

  const remove = useCallback(async (id: string) => {
    await client().remove({ id }).response;
    //swr.mutate();
  }, []);

  return {
    ...swr,
    insert,
    remove,
    update
  };
};