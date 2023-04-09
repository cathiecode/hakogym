import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import Timer from "../../../ui/Timer";
import { Item } from "../../../types/proto/running_observer";
import { ParsedMetaData, parseMetaData } from "../../meta/types";
import { useEffect, useMemo, useState } from "react";
import { formatDuration } from "../../../utils/formatDuration";
import Confirm from "../../../ui/Confirm";
import { useRunnningObserverState } from "../store";

type RunningObserverRunningCarControlProps = {
  item?: Item;
};

export default function RunningObserverRunningCarControl({
  item,
}: RunningObserverRunningCarControlProps) {
  const { forceStop, dnf, offsetPylonTouchCount, offsetDerailmentCount } =
    useRunnningObserverState();

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

  const isControlActive = !!item;

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
            <Form.Label column sm={4}>
              パイロン
            </Form.Label>
            <Col>
              <InputGroup>
                <Button
                  variant="warning"
                  onClick={() => item?.id && offsetPylonTouchCount(item.id, -1)}
                  disabled={!isControlActive}
                >
                  -
                </Button>
                <InputGroup.Text>
                  {metaData?.pylonTouchCount ?? 0}
                </InputGroup.Text>
                <Button
                  variant="warning"
                  onClick={() => item?.id && offsetPylonTouchCount(item.id, 1)}
                  disabled={!isControlActive}
                >
                  +
                </Button>
              </InputGroup>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              脱輪
            </Form.Label>
            <Col>
              <InputGroup>
                <Button
                  variant="secondary"
                  onClick={() => item?.id && offsetDerailmentCount(item.id, -1)}
                  disabled={!isControlActive}
                >
                  -
                </Button>
                <InputGroup.Text>
                  {metaData?.derailmentCount ?? 0}
                </InputGroup.Text>
                <Button
                  variant="secondary"
                  onClick={() => item?.id && offsetDerailmentCount(item.id, 1)}
                  disabled={!isControlActive}
                >
                  +
                </Button>
              </InputGroup>
            </Col>
          </Form.Group>

          <Confirm
            message="MCとして記録しますか？"
            onConfirmed={() => item?.id && dnf(item.id)}
          >
            {(props) => (
              <Button
                variant="secondary"
                className="m-1"
                {...props}
                disabled={!isControlActive}
              >
                MC
              </Button>
            )}
          </Confirm>

          <Confirm
            message="DNFとして記録しますか？"
            onConfirmed={() => item?.id && dnf(item.id)}
          >
            {(props) => (
              <Button
                variant="danger"
                className="m-1"
                {...props}
                disabled={!isControlActive}
              >
                DNF
              </Button>
            )}
          </Confirm>
        </div>
      </Card.Body>
    </Card>
  );
}
