import { Col, Container, Row } from "react-bootstrap";
import List from "../features/pending_car_queue/components/Queue";
import Page from "../ui/Page";

export default function Home() {
  return (
    <Page>
      <Container fluid>
        <Row>
          <Col xs={2}>
            test
          </Col>
          <Col>
          <List />
          </Col>
        </Row>
      </Container>
    </Page>
  );
}
