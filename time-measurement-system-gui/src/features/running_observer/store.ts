import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getPendingCarQueueAddress } from "../../api";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { ReadAllReply } from "../../types/proto/running_observer";
import { RunningObserverClient } from "../../types/proto/running_observer.client";
import { useCallback } from "react";

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
        id: id ? {value: id} : undefined,
        timestamp: BigInt(Date.now()),
      }),
    []
  );

  return { forceStart, forceStop, ...swr };
};
