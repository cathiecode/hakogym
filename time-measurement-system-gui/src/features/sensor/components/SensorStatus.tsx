import { Button, Card, Form } from "react-bootstrap";
import { useSensorStatus } from "../store";
import { ChangeEvent, useRef, useState } from "react";
import Confirm from "../../../ui/Confirm";
import showPromise from "../../../ui/toast";

function useInputHandler(
  id: string,
  options?: {
    defaultValue?: string;
    onChange?: (id: string, value: string) => void;
    onBlur?: () => void;
  }
) {
  const [value, setValue] = useState(options?.defaultValue ?? "");
  const ref = useRef<HTMLInputElement>(null);
  const onChange = (ev: ChangeEvent<HTMLInputElement>) => {
    console.log("change", ev.currentTarget.value);

    setValue(ev.currentTarget.value);

    if (!options?.onChange) {
      return;
    }

    options?.onChange(id, ev.currentTarget.value);
  };

  return [value, { value, onChange, onBlur: options?.onBlur, ref }] as const;
}

export default function SensorStatus() {
  const { status, start, stop } = useSensorStatus();

  const [com, comInputHandler] = useInputHandler("com");

  const onStart = () => {
    showPromise(start({ com }), `${com}で光電管接続を開始`);
  };

  return (
    <Card>
      <Card.Header>光電管接続</Card.Header>
      <Card.Body>
        <p>
          ステータス: <code>{status?.state}</code> (起動オプション:
          <code>{status?.args.join(" ")}</code>)
        </p>
        <Form.Group className="mb-3" onSubmit={onStart}>
          <Form.Label>COMポート</Form.Label>
          <Form.Control {...comInputHandler} />
        </Form.Group>
        <Button className="me-2" onClick={onStart}>
          起動
        </Button>
        <Confirm
          message="光電管接続を停止します。よろしいですか?"
          onConfirmed={() => showPromise(stop(), "光電管接続を停止")}
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
