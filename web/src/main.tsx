import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import config from "./config.ts";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { GlobalSnackbar } from "./components/common/GlobalSnackbar/index.jsx";
import Loading from "./components/common/Loading/index.tsx";
import { ReactFlowProvider } from "reactflow";
import TopBanner from "./components/TopBanner.tsx";
import "highlight.js/styles/github.min.css";
import "rsuite/DatePicker/styles/index.css";

posthog.init("phc_DakJVaJiJMjyu764IBSgH2A4OPV57Fu8H7I8XPE09iM", {
  api_host: "https://pumpkins.drdroid.io",
  ui_host: "https://app.posthog.com",
  disable_session_recording: false,
});

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <PostHogProvider client={posthog}>
    <ReactFlowProvider>
      <Provider store={store}>
        <BrowserRouter>
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
        </BrowserRouter>
      </Provider>
    </ReactFlowProvider>
  </PostHogProvider>,
);
