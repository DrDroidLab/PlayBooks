import React, { useEffect } from "react";
import Layout from "./Layout";
import BaseLayout from "./BaseLayout";
import { Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import NotFound from "./pages/NotFound";
import posthog from "posthog-js";
import { useSelector } from "react-redux";
import { selectEmail } from "./store/features/auth/authSlice.ts";

const Login = React.lazy(() => import("./pages/Login"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const ConnectorPage = React.lazy(() =>
  import("./components/Integration/connectors/ConnectorPage"),
);
const Integrations = React.lazy(() => import("./components/Integration"));
const Playbooks = React.lazy(() => import("./components/Playbooks"));
const CreateWorkflow = React.lazy(() =>
  import("./components/Playbooks/CreateWorkflow.jsx"),
);
const Playground = React.lazy(() => import("./components/Playgrounds"));
const InviteTeam = React.lazy(() => import("./components/InviteTeam"));
const Support = React.lazy(() => import("./components/Support"));
const ApiTokens = React.lazy(() => import("./components/Apikeys/Apikeys"));
const EditPlaybook = React.lazy(() =>
  import("./components/Playbooks/EditPlaybook.jsx"),
);
const CreatePlaybook = React.lazy(() =>
  import("./components/Playbooks/CreatePlaybook"),
);
const PlaybookLog = React.lazy(() =>
  import("./components/Playbooks/logs/PlaybookLog"),
);

const App = () => {
  const email = useSelector(selectEmail);
  useEffect(() => {
    if (email) {
      posthog.identify(email);
    }
  }, [email]);

  useEffect(() => {
    // Hide the loading indicator
    const loader = document.querySelector(".loader-container");
    if (loader) {
      loader.style.display = "none";
    }
  }, []);

  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route exact path="/" element={<Playbooks />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route path="/playbooks/create" element={<CreatePlaybook />} />
          <Route path="/playbooks/:playbook_id" element={<EditPlaybook />} />
          <Route
            path="/playbooks/edit/:playbook_id"
            element={<EditPlaybook />}
          />
          <Route
            path="/playbooks/logs/:playbook_run_id"
            element={<PlaybookLog />}
          />
          <Route
            path="/playbooks/workflows/create"
            element={<CreateWorkflow />}
          />
          <Route path="/playgrounds" element={<Playground />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/integrations/:id" element={<ConnectorPage />} />
          <Route path="/api-keys" element={<ApiTokens />} />
          <Route path="/invite-team" element={<InviteTeam />} />
          <Route path="/support" element={<Support />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
