import { Button } from "react-bootstrap";
import { useList } from "../store";
import Confirm from "../../../ui/Confirm";

export default function QueueControl() {
  const { removeAll } = useList();
  return (
    <>
      <Confirm
        message="出走待ちリストを空にします。よろしいですか？"
        onConfirmed={() => removeAll()}
      >
        {(props) => (
          <Button className="m-1" variant="danger" {...props}>
            出走待ちリストを削除
          </Button>
        )}
      </Confirm>
    </>
  );
}
