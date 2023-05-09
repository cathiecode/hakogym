import { Card, Col, Container, Row, Table } from "react-bootstrap";
import Page from "../ui/Page";
import QueueControl from "../features/pending_car_queue/components/QueueControl";
import RunningObserverControl from "../features/running_observer/components/RunningObserverControl";
import CombinedTable from "../features/combined/components/CombinedTable";
import LatestResultControl from "../features/combined/components/LatestResultControl";
import Barrier from "../ui/Barrier";

function MainColumn() {
  return <CombinedTable />;
}

export default function Home() {
  return (
    <Page>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <div style={{ width: "20em", flexShrink: "0", margin: "0 1em", overflow: "auto" }}>
          <Barrier>
            <LatestResultControl />
          </Barrier>
          <Barrier>
            <RunningObserverControl />
          </Barrier>
          <Barrier>
            <Card>
              <Card.Body>
                <QueueControl />
              </Card.Body>
            </Card>
          </Barrier>
        </div>
        <div style={{ height: "100%", overflowX: "auto", overflowY: "scroll"}}>
          <Barrier>
            <MainColumn />
          </Barrier>
        </div>
      </div>
    </Page>
  );
}
