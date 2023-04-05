import { useState } from "react";
import { InsertedItem } from "../../../types/proto/pending_car_queue";
import showPromise from "../../../ui/toast";
import { defaultMetaData } from "../../meta/types";
import { useList } from "../store";
import QueueItemEditor from "./QueueItemEditor";

export default function AddQueueItem() {
  const { insert } = useList();

  const [resetter, setResetter] = useState<
    ((reason: string) => void) | undefined
  >(undefined);

  return (
    <QueueItemEditor
      item={{ id: "UNDEFINED", meta: defaultMetaData() }}
      actionLabel="追加"
      onSubmit={async (item: InsertedItem) => {
        await showPromise(insert(item), "挿入");
        resetter && resetter("submit");
      }}
      onResetter={(resetter) => setResetter(() => resetter)}
    />
  );
}
