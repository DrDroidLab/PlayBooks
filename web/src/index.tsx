import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TimeRangeProvider } from "./context/TimeRangeProvider";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { GlobalSnackbar } from "./components/common/GlobalSnackbar/index.jsx";
import Loading from "./components/common/Loading/index.tsx";
import { ReactFlowProvider } from "reactflow";

if (process.env.POSTHOG_ENABLED === "true") {
  posthog.init("phc_DakJVaJiJMjyu764IBSgH2A4OPV57Fu8H7I8XPE09iM", {
    api_host: "https://pumpkins.drdroid.io",
    ui_host: "https://app.posthog.com",
  });
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <PostHogProvider client={posthog}>
    <ReactFlowProvider>
      <Provider store={store}>
        <BrowserRouter>
          <TimeRangeProvider>
            <Routes>
              <Route
                path={"/*"}
                element={
                  <React.Suspense fallback={<Loading />}>
                    <App />
                  </React.Suspense>
                }
              />
            </Routes>
            <GlobalSnackbar />
          </TimeRangeProvider>
        </BrowserRouter>
      </Provider>
    </ReactFlowProvider>
  </PostHogProvider>,
);
