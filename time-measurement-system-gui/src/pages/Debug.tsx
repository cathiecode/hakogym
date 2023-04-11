import { Alert, Button, Container } from "react-bootstrap";
import Page from "../ui/Page";
import { RunningObserverClient } from "../types/proto/running_observer.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getPendingCarQueueAddress } from "../api";
import { toast } from "react-hot-toast";
import { atom, useAtom } from "jotai";
import ServiceStatusDebug from "../features/service_manager/components/ServiceStatusDebug";

const debugAtom = atom(false);
const abortsAtom = atom<AbortController[]>([]);

function SubscriptionBomb() {
  const [aborts, setAborts] = useAtom(abortsAtom);

  return (
    <div>
      <Button
        variant="danger"
        onClick={() => {
          const aborts: AbortController[] = [];
          for (let i = 0; i < 1; i++) {
            (async () => {
              const abort = new AbortController();
              const connection = runningClient().subscribeChange(
                {},
                { abort: abort.signal }
              );

              aborts.push(abort);

              await connection;
              toast.error("One of onnection bomb disconnected");
            })();
          }
          setAborts((currentAborts) => {
            return [...currentAborts, ...aborts];
          });
        }}
      >
        Subscription bomb
      </Button>
      current subscription count: {aborts.length}
      <Button
        onClick={() => {
          aborts.forEach((abort) => abort.abort());
          setAborts([]);
        }}
      >
        Abort
      </Button>
    </div>
  );
}

const runningClient = () =>
  new RunningObserverClient(
    new GrpcWebFetchTransport({ baseUrl: getPendingCarQueueAddress() })
  );

export default function DebugRoom() {
  const [enableDebug, setEnableDebug] = useAtom(debugAtom);

  if (!enableDebug) {
    return (
      <Page>
        <Container fluid>
          <h1>デバッグ機能</h1>
          <Alert variant="warning">
            デバッグ機能の使用は競技進行に致命的な問題を発生させる場合があります。開発中にのみ使用してください。
          </Alert>
          <Button variant="danger" onClick={() => setEnableDebug(true)}>
            デバッグ機能を有効化
          </Button>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <Container fluid>
        <h1>デバッグ機能</h1>
        <Alert variant="info">デバッグ機能が有効です。</Alert>
        <p>
          <Button onClick={() => setEnableDebug(false)}>
            デバッグ機能を無効化
          </Button>
        </p>
        <SubscriptionBomb />
        <ServiceStatusDebug />
      </Container>
    </Page>
  );
}
