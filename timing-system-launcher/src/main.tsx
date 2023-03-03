import React from "react";
import ReactDOM from "react-dom";
import "ress";
import "./index.css";
import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";

import StartPage from "./pages/StartPage";
import StatusPage from "./pages/StatusPage";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./components/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />,
    errorElement: <Error />,
  },
  {
    path: "/status",
    element: <StatusPage />,
    errorElement: <Error />,
  },
]);

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary fallbackRender={() => <Error />}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
