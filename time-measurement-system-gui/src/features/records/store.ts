import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { RecordsClient } from "../../types/proto/records.client";
import { getRecordsAddress } from "../../api";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { ReadAllReply } from "../../types/proto/records";

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

  return swr;
}
