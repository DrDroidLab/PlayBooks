/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Layout from "./Layout";
import BaseLayout from "./BaseLayout";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import NotFound from "./pages/NotFound";
import posthog from "posthog-js";
import { useSelector } from "react-redux";
import {
  selectAccessToken,
  selectEmail,
} from "./store/features/auth/authSlice.ts";
import "nprogress/nprogress.css";
import { useGetUserQuery } from "./store/features/auth/api/getUserApi.ts";
import Loading from "./components/common/Loading/index.tsx";
import { isUnAuth } from "./utils/auth/unauthenticatedRoutes.ts";

const Settings = React.lazy(() => import("./pages/Settings.tsx"));
const Login = React.lazy(() => import("./pages/Login"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const OAuthCallback = React.lazy(() => import("./pages/OAuthCallback.tsx"));
const ConnectorPage = React.lazy(() =>
  import("./components/Integration/connectors/ConnectorPage"),
);
const Integrations = React.lazy(() => import("./components/Integration"));
const Playbooks = React.lazy(() => import("./components/Playbooks"));
const Workflows = React.lazy(() => import("./components/Workflows"));
const CreateWorkflow = React.lazy(() =>
  import("./components/Workflows/create/CreateWorkflow.jsx"),
);
const WorkflowExecutionsList = React.lazy(() =>
  import("./components/Workflows/executions/WorkflowExecutionList.jsx"),
);
const WorkflowExecutionLogs = React.lazy(() =>
  import("./components/Workflows/executions/WorkflowExecutionLogs.jsx"),
);
const WorkflowExecutions = React.lazy(() =>
  import("./components/Workflows/executions/WorkflowExecutions.jsx"),
);
const PlaybookExecutions = React.lazy(() =>
  import("./components/Playbooks/executions/PlaybookExecutions.jsx"),
);
const PlaybookExecutionsList = React.lazy(() =>
  import("./components/Playbooks/executions/PlaybookExecutionsList.jsx"),
);
const Playground = React.lazy(() => import("./components/Playgrounds"));
const InviteTeam = React.lazy(() => import("./components/InviteTeam"));
const Support = React.lazy(() => import("./components/Support"));
const ApiTokens = React.lazy(() => import("./components/Apikeys/Apikeys"));
const CreatePlaybook = React.lazy(() =>
  import("./components/Playbooks/create/index.jsx"),
);
const PlaybookLog = React.lazy(() =>
  import("./components/Playbooks/logs/index.jsx"),
);
const DataSources = React.lazy(() => import("./pages/DataSources.tsx"));

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = useSelector(selectEmail);
  const accessToken = useSelector(selectAccessToken);
  const { isLoading, data, isError } = useGetUserQuery();

  useEffect(() => {
    if (email) {
      posthog.identify(email);
    }
  }, [email]);

  useEffect(() => {
    if (!data && isError && !isUnAuth) {
      navigate("/signup", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [data, isError, accessToken]);

  useEffect(() => {
    const loader = document.querySelector(".loader-container");
    if (loader) {
      loader.style.display = "none";
    }
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path="/oauth/callback/:oauthId" element={<OAuthCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/playbooks/create" element={<CreatePlaybook />} />
        <Route path="/playbooks/:playbook_id" element={<CreatePlaybook />} />
        <Route
          path="/playbooks/logs/:playbook_run_id"
          element={<PlaybookLog />}
        />
        <Route
          path="/playbooks/edit/:playbook_id"
          element={<CreatePlaybook />}
        />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Playbooks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route
            path="/playbooks/executions/list"
            element={<PlaybookExecutionsList />}
          />
          <Route
            path="/playbooks/executions/:id"
            element={<PlaybookExecutions />}
          />
          {/* <Route
            path="/playbooks/logs/:playbook_run_id"
            element={<PlaybookLog />}
          /> */}
          <Route path="/workflows/create" element={<CreateWorkflow />} />
          <Route exact path="/workflows" element={<Workflows />} />
          <Route path="/workflows/:id" element={<CreateWorkflow />} />
          <Route
            path="/workflows/executions/:id"
            element={<WorkflowExecutions />}
          />
          <Route path="/executions/list" element={<WorkflowExecutionsList />} />
          <Route
            path="/workflows/logs/:workflow_run_id"
            element={<WorkflowExecutionLogs />}
          />
          <Route path="/playgrounds" element={<Playground />} />
          <Route path="/data-sources/add" element={<Integrations />} />
          <Route path="/data-sources" element={<DataSources />} />
          <Route
            path="/data-sources/:connectorEnum"
            element={<ConnectorPage />}
          />
          <Route
            path="/data-sources/:connectorEnum/:id"
            element={<ConnectorPage />}
          />
          <Route path="/settings/api-keys" element={<ApiTokens />} />
          <Route path="/settings/invite-team" element={<InviteTeam />} />
          <Route path="/support" element={<Support />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
