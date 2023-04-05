import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import Timer from "../../../ui/Timer";
import { Item } from "../../../types/proto/running_observer";
import { parseMetaData } from "../../meta/types";
import { useMemo } from "react";
import { formatDuration } from "../../../utils/formatDuration";
import { todo } from "../../../utils/todo";
import Confirm from "../../../ui/Confirm";

type RunningObserverRunningCarControlProps = {
  item?: Item;
};

export default function RunningObserverRunningCarControl({
  item,
}: RunningObserverRunningCarControlProps) {
  const metaData = useMemo(() => {
    if (!item) {
      return null;
    }
    try {
      return parseMetaData(item?.meta);
    } catch (e) {
      return null;
    }
  }, [item]);

  return (
    <Card className="mb-3">
      <Card.Header>
        {item ? metaData?.carId || "(ゼッケンなし)" : "待機中"}
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          {item ? (
            <Timer startTimeStamp={Number(item.startAt)} />
          ) : (
            formatDuration(0)
          )}
        </div>
        <div>
          <Form.Group as={Row} className="mb-2">
            <Form.Label column sm={4}>パイロン</Form.Label>
            <Col>
              <InputGroup>
                <Button variant="warning" onClick={todo}>
                  -
                </Button>
                <InputGroup.Text>
                  {metaData?.pylonTouchCount ?? 0}
                </InputGroup.Text>
                <Button variant="warning" onClick={todo}>
                  +
                </Button>
              </InputGroup>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>脱輪</Form.Label>
            <Col>
              <InputGroup>
                <Button variant="secondary" onClick={todo}>
                  -
                </Button>
                <InputGroup.Text>
                  {metaData?.derailmentCount ?? 0}
                </InputGroup.Text>
                <Button variant="secondary" onClick={todo}>
                  +
                </Button>
              </InputGroup>
            </Col>
          </Form.Group>

          <Button variant="warning" className="m-1" onClick={todo}>
            手動ストップ
          </Button>

          <Confirm message="DNFとして記録しますか？" onConfirmed={todo}>
            {(props) => (
              <Button variant="danger" className="m-1" {...props}>
                DNF
              </Button>
            )}
          </Confirm>
        </div>
      </Card.Body>
    </Card>
  );
}
