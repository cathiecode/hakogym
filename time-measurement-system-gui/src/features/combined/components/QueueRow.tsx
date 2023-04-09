import { InsertedItem } from "../../../types/proto/pending_car_queue";
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
  const onMetaChange = async (meta: string) => {
    if (onChange) {
      await onChange({
        ...item,
        meta,
      });
    }
  };

  return (
    <>
      <MetaCells value={item.meta} onChange={onMetaChange} />
      <td>{formatDuration(0)}</td>
      <td>
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
