import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { PendingCarQueueClient } from "../../types/proto/pending_car_queue.client";
import { getPendingCarQueueAddress } from "../../api";

const client = () =>
  new PendingCarQueueClient(
    new GrpcWebFetchTransport({ baseUrl: getPendingCarQueueAddress() })
  );

export const useRunnningObserverState = () => {
  return {};
};
