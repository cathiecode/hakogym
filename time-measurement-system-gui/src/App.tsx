import Router from "./Router";
import "bootstrap/dist/css/bootstrap.min.css";
import Barrier from "./ui/Barrier";
import { Toaster } from "react-hot-toast";

import "./App.css"

function App() {
  return (
    <Barrier>
      <Router />
      <Toaster position="top-right" />
    </Barrier>
  );
}

export default App;
