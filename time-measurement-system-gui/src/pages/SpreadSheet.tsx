import { Alert, Container } from "react-bootstrap";
import Page from "../ui/Page";
import SpreadSheetStatus from "../features/spreadsheet/components/SpreadSheetStatus";

export default function SpreadSheet() {
  return (
    <Page>
      <Container fluid>
        <Alert variant="info">
          書き出し先のシートのタイトルが<code>HAS_TIMING_SYSTEM</code>
          となっていることを確認してください (
          <a
            href="https://github.com/cathiecode/hakogym/wiki/%E8%A8%88%E6%B8%AC%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9#%E3%82%B9%E3%83%97%E3%83%AC%E3%83%83%E3%83%89%E3%82%B7%E3%83%BC%E3%83%88%E6%8E%A5%E7%B6%9A"
            target="_blank"
            rel="noreferrer"
          >
            ヘルプ
          </a>
          )
        </Alert>
        <SpreadSheetStatus />
      </Container>
    </Page>
  );
}
