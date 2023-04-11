import { Alert, Container } from "react-bootstrap";
import Page from "../ui/Page";
import SpreadSheetStatus from "../features/spreadsheet/components/SpreadSheetStatus";

export default function SpreadSheet() {
  return (
    <Page>
      <Container fluid>
        <Alert variant="info">
            書き出し先のシートのタイトルが<code>HAS_TIMING_SYSTEM</code>となっていることを確認してください
        </Alert>
        <SpreadSheetStatus />
      </Container>
    </Page>
  );
}
