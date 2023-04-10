import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { AggrigatedChangeBroadcasterClient } from "./types/proto/aggrigated_change_broadcaster.client";

export function getPendingCarQueueAddress() {
  return "http://localhost:11000";
}

export function getRunningObserverAddress() {
  return "http://localhost:11000";
}

export function getRecordsAddress() {
  return "http://localhost:11000";
}

export function getAggrigatedChangeBroadcasterAddress() {
  return "http://localhost:11000";
}

type UnSubscribe = () => void;

function subscribeAggrigatedChange(
  onChange: () => void,
  onConnectionLost: (e: unknown) => void
): UnSubscribe {
  const client = new AggrigatedChangeBroadcasterClient(
    new GrpcWebFetchTransport({
      baseUrl: getAggrigatedChangeBroadcasterAddress(),
    })
  );

  const abort = new AbortController();
  const connection = client.subscribeChange({}, { abort: abort.signal });
  console.log("subscription start!");

  (async () => {
    try {
      for await (const _ of connection.responses) {
        onChange();
      }

      await connection;
    } catch (e) {
      if (abort.signal.aborted) {
        return;
      }
      console.log("Connection lost");
      onConnectionLost(e);
    }
  })();

  return () => {
    console.log("unsubscribed!");
    abort.abort("unsubscribe");
  };
}

let subscriptionCount = 0;
let unsubscribe: ReturnType<typeof pooledSubscribeAggrigatedChange> | null =
  null;

let onChangeListeners: (() => void)[] = [];
let onConnectionLostListeners: ((e: unknown) => void)[] = [];

export function pooledSubscribeAggrigatedChange(
  onChange: () => void,
  onConnectionLost: (e: unknown) => void
): UnSubscribe {
  if (subscriptionCount <= 0) {
    console.log("creating new subscription");
    unsubscribe = subscribeAggrigatedChange(
      () => {
        onChangeListeners.forEach((listener) => listener());
      },
      (e) => {
        onConnectionLostListeners.forEach((listener) => listener(e));
        unsubscribe = null;
        subscriptionCount = 0;
        onChangeListeners = [];
        onConnectionLostListeners = [];
        console.log("unsubscribe done!");
      }
    );
  } else {
    console.log("using pooled subscription");
  }

  onChangeListeners.push(onChange);
  onConnectionLostListeners.push(onConnectionLost);

  subscriptionCount++;
  console.log("add subscirption count");

  return () => {
    onChangeListeners = onChangeListeners.filter(
      (listener) => listener === onChange
    );
    onConnectionLostListeners = onConnectionLostListeners.filter(
      (listener) => listener === onConnectionLost
    );

    console.log("remove subscirption count");
    subscriptionCount--;

    if (subscriptionCount <= 0) {
      if (!unsubscribe) {
        throw new Error("Logic Error");
      }

      unsubscribe();
    }
  };
}
