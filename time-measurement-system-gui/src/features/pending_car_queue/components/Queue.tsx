import { Button, Table } from "react-bootstrap";
import { useList } from "../store";
import Loader from "../../../ui/Loader";
import showPromise from "../../../ui/toast";
import { InsertedItem } from "../../../types/proto/pending_car_queue";
import { useToggle } from "usehooks-ts";
import QueueItemEditor from "./QueueItemEditor";
import Barrier from "../../../ui/Barrier";
import MetaHeaderCells from "../../meta/component/MetaHeaderCells";
import MetaCells from "../../meta/component/MetaCells";
import JointMetaCell from "../../meta/component/JointMetaCell";

function Row({
  item,
  onChange,
  onRemove,
}: {
  item: InsertedItem;
  onChange?: (value: InsertedItem) => Promise<void>;
  onRemove?: (id: string) => void;
}) {
  const [editing, toggleEditing, setEditing] = useToggle(false);

  if (editing) {
    return (
      <td colSpan={3}>
        <div className="flex">
          <Barrier>
            <QueueItemEditor
              item={item}
              onSubmit={async (item) => {
                if (onChange) {
                  await showPromise(onChange(item), "編集");
                }

                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              onRemove={() => onRemove && onRemove(item.id)}
            />
          </Barrier>
        </div>
      </td>
    );
  } else {
    return (
      <>
        <MetaCells value={item.meta} />
        <td>
          <Button variant="light" onClick={() => setEditing(true)}>
            編集
          </Button>
        </td>
      </>
    );
  }
}

export default function Queue() {
  const { insert, update, remove, ...swr } = useList();

  return (
    <div>
      <Loader {...swr}>
        {(data) => (
          <Table hover>
            <thead>
              <tr>
                <MetaHeaderCells />
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.item.map((item) => (
                <tr key={item.id}>
                  <Row
                    key={item.id}
                    item={item}
                    onChange={(to) => showPromise(update(to), "更新")}
                    onRemove={() => showPromise(remove(item.id), "削除")}
                  />
                </tr>
              ))}
              <tr>
                <JointMetaCell />
                <td>
                  <Button
                    onClick={() =>
                      showPromise(
                        insert({ carId: "CarId mock" }),
                        "キューに追加"
                      )
                    }
                  >
                    キューに追加
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        )}
      </Loader>
    </div>
  );
}
