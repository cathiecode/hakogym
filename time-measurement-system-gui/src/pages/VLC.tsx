import { Container } from "react-bootstrap";
import Page from "../ui/Page";
import VLCStatus from "../features/vlc/components/VLCStatus";

export default function VLC() {
  return (
    <Page>
      <Container fluid>
        <VLCStatus />
      </Container>
    </Page>
  );
}
