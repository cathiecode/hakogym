import { Container } from "react-bootstrap";
import SensorStatus from "../features/sensor/components/SensorStatus";
import Page from "../ui/Page";

export default function Sensor() {
  return (
    <Page>
      <Container fluid>
        <SensorStatus />
      </Container>
    </Page>
  );
}
