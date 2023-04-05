import { Card, Col, Container, Row, Table } from "react-bootstrap";
import Page from "../ui/Page";
import QueueControl from "../features/pending_car_queue/components/QueueControl";
import RunningObserverControl from "../features/running_observer/components/RunningObserverControl";
import CombinedTable from "../features/combined_table/components/CombinedTable";

function MainColumn() {
  return <CombinedTable />;
}

export default function Home() {
  return (
    <Page>
      <Container fluid>
        <Row>
          <Col lg={3} className="mb-3">
            <RunningObserverControl />
            <Card>
              <Card.Body>
                <QueueControl />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <MainColumn />
          </Col>
        </Row>
      </Container>
    </Page>
  );
}
