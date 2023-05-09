import { Button, Card } from "react-bootstrap";
import { useVLCStatus } from "../store";
import Confirm from "../../../ui/Confirm";
import showPromise from "../../../ui/toast";

export default function VLCStatus() {
  const { status, start, stop } = useVLCStatus();

  const onStart = () => {
    showPromise(start({}), `VLC接続を開始`);
  };

  return (
    <Card>
      <Card.Header>VLC接続</Card.Header>
      <Card.Body>
        <p>
          ステータス: <code>{status?.state}</code> (起動オプション:
          <code>{status?.args.join(" ")}</code>)
        </p>
        <Button className="me-2" onClick={onStart}>
          開始
        </Button>
        <Confirm
          message="VLC接続を停止します。よろしいですか?"
          onConfirmed={() => showPromise(stop(), "VLCの接続を停止")}
        >
          {(props) => (
            <Button {...props} type="button" variant="danger">
              停止
            </Button>
          )}
        </Confirm>
      </Card.Body>
    </Card>
  );
}
