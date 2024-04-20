import React, { useEffect } from "react";
import Layout from "./Layout";
import BaseLayout from "./BaseLayout";
import { Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import AxiosPrivate from "./components/AxiosPrivate";
import NotFound from "./pages/NotFound";
import useAuth from "./hooks/useAuth.js";
import posthog from "posthog-js";

const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const ResetPasswordConfirm = React.lazy(() =>
  import("./pages/ResetPasswordConfirm"),
);
const Login = React.lazy(() => import("./pages/Login"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const ConfirmEmail = React.lazy(() => import("./pages/ConfirmEmail"));
const ConnectorPage = React.lazy(() =>
  import("./components/Integration/connectors/ConnectorPage"),
);
const Integrations = React.lazy(() => import("./components/Integration"));
const Playbooks = React.lazy(() => import("./components/Playbooks"));
const PlaybookTriggers = React.lazy(() =>
  import("./components/Playbooks/triggers/PlaybookTriggers.jsx"),
);
const CreateTrigger = React.lazy(() =>
  import("./components/Playbooks/triggers/CreateTrigger.jsx"),
);
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
  const { auth } = useAuth();

  useEffect(() => {
    if (auth.email) {
      posthog.identify(auth.email);
    }
  }, [auth]);

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
        <Route path="/confirm-email/:key?" element={<ConfirmEmail />} />
        <Route path="/reset-password/" element={<ResetPassword />} />
        <Route
          path="/reset-password-confirm/"
          element={<ResetPasswordConfirm />}
        />
      </Route>

      <Route element={<PersistLogin />}>
        <Route element={<RequireAuth />}>
          <Route element={<AxiosPrivate />}>
            <Route element={<Layout />}>
              <Route exact path="/" element={<Playbooks />} />
              <Route path="/playbooks" element={<Playbooks />} />
              <Route path="/playbooks/create" element={<CreatePlaybook />} />
              <Route
                path="/playbooks/:playbook_id"
                element={<EditPlaybook />}
              />
              <Route
                path="/playbooks/edit/:playbook_id"
                element={<EditPlaybook />}
              />
              <Route
                path="/playbooks/logs/:playbook_run_id"
                element={<PlaybookLog />}
              />
              <Route
                path="/playbooks/triggers/:playbook_id"
                element={<PlaybookTriggers />}
              />
              <Route
                path="/playbooks/triggers/create/:playbook_id"
                element={<CreateTrigger />}
              />
              <Route
                path="/playbooks/workflows/create"
                element={<CreateWorkflow />}
              />
              <Route
                path="/playbooks/triggers/view/:playbook_id/:triggerId"
                element={<CreateTrigger />}
              />
              <Route path="/playgrounds" element={<Playground />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/integrations/:id" element={<ConnectorPage />} />
              <Route path="/api-keys" element={<ApiTokens />} />
              <Route path="/invite-team" element={<InviteTeam />} />
              <Route path="/support" element={<Support />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
