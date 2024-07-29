import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import config from "./config";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { GlobalSnackbar } from "./components/common/GlobalSnackbar";
import { ReactFlowProvider } from "reactflow";
import "highlight.js/styles/github.min.css";
import "rsuite/DatePicker/styles/index.css";

if (config.posthogEnabled === "true") {
  posthog.init("phc_DakJVaJiJMjyu764IBSgH2A4OPV57Fu8H7I8XPE09iM", {
    api_host: "https://pumpkins.drdroid.io",
    ui_host: "https://app.posthog.com",
    disable_session_recording: true,
  });
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <PostHogProvider client={posthog}>
    <ReactFlowProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <GlobalSnackbar />
        </BrowserRouter>
      </Provider>
    </ReactFlowProvider>
  </PostHogProvider>,
);
