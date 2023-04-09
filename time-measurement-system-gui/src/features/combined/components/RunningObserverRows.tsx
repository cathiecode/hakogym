import { Table } from "react-bootstrap";
import Loader from "../../../ui/Loader";
import { useRunnningObserverState } from "../../running_observer/store";
import MetaCells from "../../meta/component/MetaCells";

export default function RunningObserverRows() {
  const swr = useRunnningObserverState();

  if (!swr.data) {
    return null;
  }

  return (
    <>

    </>
  );
}
