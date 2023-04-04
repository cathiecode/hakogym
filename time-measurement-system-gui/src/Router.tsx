import { Tab, Tabs } from "react-bootstrap";
import Todo from "./ui/Todo";
import Home from "./pages/Home";

export default function Router() {
  return (
    <Tabs className="my-2 px-2">
      <Tab eventKey="home" title="Home">
        <Home />
      </Tab>
      <Tab eventKey="signalio" title="光電管">
        <Todo />
      </Tab>
      <Tab eventKey="spreadsheet" title="スプレッドシート">
        <Todo />
      </Tab>
      <Tab eventKey="music" title="VLC接続">
        <Todo />
      </Tab>
      <Tab eventKey="backup" title="バックアップ">
        <Todo />
      </Tab>
    </Tabs>
  );
}
