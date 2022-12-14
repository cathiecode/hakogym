import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {ErrorBoundary} from "react-error-boundary";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallback={
          <div>
            GUIがクラッシュしました。
            <button onClick={() => window.location.reload()}>
              画面を再起動(データは保持されます)
            </button>
          </div>
        }
      >
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>
);
