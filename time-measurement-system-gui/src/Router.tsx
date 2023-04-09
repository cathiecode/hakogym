import { Alert, Nav } from "react-bootstrap";
import Home from "./pages/Home";
import { useState } from "react";

export default function Router() {
  const [tab, setTab] = useState("home");

  let panel = null;

  switch (tab) {
    case "home":
      panel = <Home />;
      break;
    default:
      panel = <Alert variant="danger">この機能はまだ実装されていません</Alert>;
      break;
  }

  return (
    <>
      <Nav
        className="mt-2 mb-3 px-2 Nav"
        variant="tabs"
        activeKey={tab}
        onSelect={(key) => key && setTab(key)}
      >
        <Nav.Item>
          <Nav.Link eventKey="home">Home</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="signalio">光電管</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="spreadsheet">スプレッドシート</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="vlc">VLC接続</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="backup">バックアップ</Nav.Link>
        </Nav.Item>
      </Nav>
      <div className="PageContainer">{panel}</div>
    </>
  );
}
