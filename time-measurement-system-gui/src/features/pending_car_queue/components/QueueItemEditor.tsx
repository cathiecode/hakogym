import { ReactNode, RefObject, useEffect, useMemo, useState } from "react";
import { InsertedItem } from "../../../types/proto/pending_car_queue";
import stableHash from "stable-hash";
import {
  Alert,
  Button,
  Card,
  Form,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import MetaEditor from "../../meta/component/MetaEditor";
import { Controller, useForm } from "react-hook-form";
import Confirm from "../../../ui/Confirm";

type QueueItemEditorProps = {
  item: InsertedItem;
  onCancel?: () => void;
  onSubmit?: (value: InsertedItem) => void;
  onRemove?: (id: string) => void;
};

export default function QueueItemEditor({
  item,
  onCancel,
  onSubmit,
  onRemove,
}: QueueItemEditorProps) {
  const { control, formState, handleSubmit } = useForm<InsertedItem>({
    defaultValues: item,
  });

  const changedAfterEdit = useMemo(
    () => stableHash(item) !== stableHash(formState.defaultValues),
    [item, formState.defaultValues]
  );

  return (
    <Card>
      <Card.Body>
        <div>
          {changedAfterEdit ? (
            <Alert variant="warning">
              このキューは編集開始後に更新されました。保存した場合、バックグラウンドで行われた編集が失われる可能性があります。
            </Alert>
          ) : null}
        </div>
        <Form
          onSubmit={handleSubmit(
            onSubmit ??
              (() => {
                /* NOOP */
              })
          )}
        >
          <Controller
            name="meta"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <MetaEditor {...field} />}
          />
          <div>
            <Confirm
              message="出走前の車両を削除しますか?"
              onConfirmed={() => onRemove && onRemove(item.id)}
            >
              {
                (props) => <Button {...props} className="m-1">削除</Button>
              }
            </Confirm>
            <Button
              className="m-1"
              variant="secondary"
              onClick={() => onCancel && onCancel()}
            >
              キャンセル
            </Button>
            <Button type="submit" className="m-1">
              保存
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
