/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Layout from "./Layout.jsx";
import BaseLayout from "./BaseLayout.jsx";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import RequireAuth from "./components/RequireAuth.jsx";
import NotFound from "./pages/NotFound/index.jsx";
import posthog from "posthog-js";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAccessToken,
  selectEmail,
  setLastLogin,
} from "./store/features/auth/authSlice.ts";
import "nprogress/nprogress.css";
import { useGetUserQuery } from "./store/features/auth/api/getUserApi.ts";
import Loading from "./components/common/Loading/index.tsx";
import { isUnAuth } from "./utils/auth/unauthenticatedRoutes.ts";

const Settings = React.lazy(() => import("./pages/Settings.tsx"));
const Login = React.lazy(() => import("./pages/Login.jsx"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword.tsx"));
const SignUp = React.lazy(() => import("./pages/SignUp.jsx"));
const OAuthCallback = React.lazy(() => import("./pages/OAuthCallback.tsx"));
const ConnectorPage = React.lazy(() =>
  import("./components/Integration/connectors/ConnectorPage.jsx"),
);
const Integrations = React.lazy(() =>
  import("./components/Integration/index.jsx"),
);
const Playbooks = React.lazy(() => import("./components/Playbooks/index.jsx"));
const Workflows = React.lazy(() => import("./components/Workflows/index.jsx"));
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
const Playground = React.lazy(() =>
  import("./components/Playgrounds/index.jsx"),
);
const InviteTeam = React.lazy(() =>
  import("./components/InviteTeam/index.jsx"),
);
const Support = React.lazy(() => import("./components/Support/index.jsx"));
const ApiTokens = React.lazy(() => import("./components/Apikeys/Apikeys.jsx"));
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
  const dispatch = useDispatch();

  useEffect(() => {
    if (email) {
      posthog.identify(email);
    }
  }, [email]);

  useEffect(() => {
    const loader = document.querySelector(".loader-container");
    if (loader) {
      loader.style.display = "none";
    }
  }, []);

  useEffect(() => {
    if (data?.user) {
      const d = new Date().toString();
      dispatch(setLastLogin(d));
      localStorage.setItem("lastLogin", d);
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/playbooks/create" element={<CreatePlaybook />} />
      <Route path="/playbooks/:playbook_id" element={<CreatePlaybook />} />
      <Route
        path="/playbooks/logs/:playbook_run_id"
        element={<PlaybookLog />}
      />
      <Route path="/playbooks/edit/:playbook_id" element={<CreatePlaybook />} />
      <Route element={<BaseLayout />}>
        <Route path="/oauth/callback/:oauthId" element={<OAuthCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
