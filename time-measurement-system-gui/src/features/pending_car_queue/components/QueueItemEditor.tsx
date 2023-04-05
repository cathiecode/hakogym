import { RefObject, useMemo } from "react";
import { InsertedItem } from "../../../types/proto/pending_car_queue";
import stableHash from "stable-hash";
import { Alert, Button, Form } from "react-bootstrap";
import MetaEditor from "../../meta/component/MetaEditor";
import { Controller, useForm } from "react-hook-form";
import Confirm from "../../../ui/Confirm";

type QueueItemEditorProps = {
  item: InsertedItem;
  actionLabel?: string;
  resetOnSubmit?: boolean;
  onCancel?: () => void;
  onSubmit?: (value: InsertedItem) => void;
  onRemove?: (id: string) => void;
  onResetter?: (reset: (reason: string) => void) => void;
  formRef?: RefObject<HTMLFormElement>;
};

export default function QueueItemEditor({
  item,
  actionLabel,
  resetOnSubmit,
  onCancel,
  onSubmit,
  onRemove,
}: QueueItemEditorProps) {
  const { control, formState, handleSubmit, reset } =
    useForm<InsertedItem>({
      defaultValues: item,
    });

  const changedAfterEdit = useMemo(
    () => stableHash(item) !== stableHash(formState.defaultValues),
    [item, formState.defaultValues]
  );

  return (
    <>
      <div>
        {changedAfterEdit ? (
          <Alert variant="warning">
            このキューは編集開始後に更新されました。保存した場合、バックグラウンドで行われた編集が失われる可能性があります。
          </Alert>
        ) : null}
      </div>
      <Form
        onSubmit={handleSubmit((v) => {
          if (resetOnSubmit) {
            reset();
          }
          onSubmit && onSubmit(v);
        })}
      >
        <Controller
          name="meta"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <MetaEditor {...field} />}
        />
        <div>
          {onRemove && (
            <Confirm
              message="出走前の車両を削除しますか?"
              onConfirmed={() => onRemove && onRemove(item.id)}
            >
              {(props) => (
                <Button {...props} variant="danger" className="m-1">
                  削除
                </Button>
              )}
            </Confirm>
          )}
          {onCancel && (
            <Button
              className="m-1"
              variant="secondary"
              onClick={() => onCancel()}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" className="m-1">
            {actionLabel ?? "保存"}
          </Button>
        </div>
      </Form>
    </>
  );
}
