import { Button, Card, Form } from "react-bootstrap";
import { useSpreadSheetStatus } from "../store";
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

export default function SpreadSheetStatus() {
  const { status, start, stop } = useSpreadSheetStatus();

  const [spreadSheetId, spreadSheetIdProps] = useInputHandler("spreadSheetId");
  const [startRow, startRowProps] = useInputHandler("startRow");

  const onStart = () => {
    showPromise(
      start({ spreadSheetId, startRow }),
      `スプレッドシートの接続を開始`
    );
  };

  return (
    <Card>
      <Card.Header>スプレッドシート接続</Card.Header>
      <Card.Body>
        <p>
          ステータス: <code>{status?.state}</code> (起動オプション:
          <code>{status?.args.join(" ")}</code>)
        </p>
        <Form.Group className="mb-3" onSubmit={onStart}>
          <Form.Label>スプレッドシートID</Form.Label>
          <Form.Control {...spreadSheetIdProps} />
        </Form.Group>
        <details className="mb-3">
          <summary>高度な設定</summary>
          <Form.Group className="mb-3" onSubmit={onStart}>
            <Form.Label>開始行/列を指定</Form.Label>
            <Form.Control {...startRowProps} />
          </Form.Group>
        </details>
        <Button className="me-2" onClick={onStart}>
          開始
        </Button>
        <Confirm
          message="スプレッドシート接続を停止します。よろしいですか?"
          onConfirmed={() =>
            showPromise(stop(), "スプレッドシートの接続を停止")
          }
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
