import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { RecordsClient } from "../../types/proto/records.client";
import { getRecordsAddress } from "../../api";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { ReadAllReply } from "../../types/proto/records";
import { useCallback } from "react";
import { ParsedMetaData, packMetaData, parseMetaData } from "../meta/types";

const client = () =>
  new RecordsClient(
    new GrpcWebFetchTransport({ baseUrl: getRecordsAddress() })
  );

export default function useRecords() {
  const swr = useSWRSubscription(
    ["records", "useList"],
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

  return {updateMetadata, ...swr};
}
