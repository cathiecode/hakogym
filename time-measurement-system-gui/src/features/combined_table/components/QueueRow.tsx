import { useState } from "react";
import { InsertedItem } from "../../../types/proto/pending_car_queue";
import JointMetaCell from "../../meta/component/JointMetaCell";
import Barrier from "../../../ui/Barrier";
import QueueItemEditor from "../../pending_car_queue/components/QueueItemEditor";
import MetaCells from "../../meta/component/MetaCells";
import { Button } from "react-bootstrap";
import Confirm from "../../../ui/Confirm";
import { formatDuration } from "../../../utils/formatDuration";

export default function QueueRow({
  item,
  onChange,
  onRemove,
}: {
  item: InsertedItem;
  onChange?: (value: InsertedItem) => Promise<void>;
  onRemove?: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <JointMetaCell extendCol={2}>
        <div className="flex">
          <Barrier>
            <QueueItemEditor
              item={item}
              onSubmit={async (item) => {
                if (onChange) {
                  await onChange(item);
                }

                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              onRemove={() => onRemove && onRemove(item.id)}
            />
          </Barrier>
        </div>
      </JointMetaCell>
    );
  } else {
    return (
      <>
        <td>{formatDuration(0)}</td>
        <MetaCells value={item.meta} />
        <td>
          <Button
            variant="light"
            className="mx-1"
            onClick={() => setEditing(true)}
          >
            編集
          </Button>
          <Confirm
            message="出走前の車両を削除しますか?"
            onConfirmed={() => onRemove && onRemove(item.id)}
          >
            {(props) => (
              <Button {...props} variant="danger" className="mx-1">
                削除
              </Button>
            )}
          </Confirm>
        </td>
      </>
    );
  }
}
