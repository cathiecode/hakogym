import Router from "./Router";
import "bootstrap/dist/css/bootstrap.min.css";
import Barrier from "./ui/Barrier";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Barrier>
      <Toaster position="bottom-right" />
      <Router />
    </Barrier>
  );
}

export default App;
