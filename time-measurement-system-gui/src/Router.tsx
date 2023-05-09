import { Alert, Nav } from "react-bootstrap";
import Home from "./pages/Home";
import { useState } from "react";
import Sensor from "./pages/Sensor";
import Debug from "./pages/Debug";
import Barrier from "./ui/Barrier";
import ServiceStatusIcon from "./features/service_manager/components/ServiceStatusIcon";
import SpreadSheet from "./pages/SpreadSheet";
import VLCStatus from "./features/vlc/components/VLCStatus";
import VLC from "./pages/VLC";

export default function Router() {
  const [tab, setTab] = useState("home");

  let panel = null;

  switch (tab) {
    case "home":
      panel = <Home />;
      break;
    case "sensor":
      panel = <Sensor />;
      break;
    case "spreadsheet":
      panel = <SpreadSheet />;
      break;
    case "vlc":
      panel = <VLC />
      break;
    case "debug":
      panel = (
        <Barrier>
          <Debug />
        </Barrier>
      );
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
          <Nav.Link eventKey="home">
          <ServiceStatusIcon service="main" />
            Home
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="sensor">
            <ServiceStatusIcon service="sensor" />
            光電管
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="spreadsheet">
            <ServiceStatusIcon service="google-spreadsheet-sync" />
            スプレッドシート
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="vlc">
            <ServiceStatusIcon service="time-measurement-system-vlc-connection" />
            VLC接続
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="backup">バックアップ</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="debug">デバッグ</Nav.Link>
        </Nav.Item>
      </Nav>
      <div className="PageContainer">{panel}</div>
    </>
  );
}
