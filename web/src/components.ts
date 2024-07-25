import { PageKeys } from "./pageKeys.ts";

export const components = {
  [PageKeys.LOGIN]: "./pages/Login.jsx",
  [PageKeys.SIGNUP]: "./pages/SignUp.jsx",
  [PageKeys.RESET_PASSWORD]: "./pages/ResetPassword.tsx",
  [PageKeys.OAUTH_CALLBACK]: "./pages/OAuthCallback.tsx",
  [PageKeys.PLAYBOOKS_CREATE]: "./components/Playbooks/create/index.jsx",
  [PageKeys.PLAYBOOK_VIEW]: "./components/Playbooks/create/index.jsx",
  [PageKeys.PLAYBOOK_LOGS]: "./components/Playbooks/logs/index.jsx",
  [PageKeys.PLAYBOOK_EDIT]: "./components/Playbooks/create/index.jsx",
  [PageKeys.HOME]: "./components/Playbooks/index.jsx",
  [PageKeys.SETTINGS]: "./pages/Settings.tsx",
  [PageKeys.PLAYBOOKS]: "./components/Playbooks/index.jsx",
  [PageKeys.PLAYBOOK_EXECUTIONS_LIST]:
    "./components/Playbooks/executions/PlaybookExecutionsList.jsx",
  [PageKeys.PLAYBOOK_EXECUTIONS]:
    "./components/Playbooks/executions/PlaybookExecutions.jsx",
  [PageKeys.WORKFLOWS_CREATE]:
    "./components/Workflows/create/CreateWorkflow.jsx",
  [PageKeys.WORKFLOWS]: "./components/Workflows/index.jsx",
  [PageKeys.WORKFLOW_VIEW]: "./components/Workflows/create/CreateWorkflow.jsx",
  [PageKeys.WORKFLOW_EXECUTIONS]:
    "./components/Workflows/executions/WorkflowExecutions.jsx",
  [PageKeys.WORKFLOW_EXECUTIONS_LIST]:
    "./components/Workflows/executions/WorkflowExecutionList.jsx",
  [PageKeys.WORKFLOW_EXECUTION_LOGS]:
    "./components/Workflows/executions/WorkflowExecutionLogs.jsx",
  [PageKeys.PLAYGROUND]: "./components/Playgrounds/index.jsx",
  [PageKeys.INTEGRATIONS_ADD]: "./components/Integration/index.jsx",
  [PageKeys.DATA_SOURCES]: "./pages/DataSources.tsx",
  [PageKeys.CONNECTOR_PAGE]:
    "./components/Integration/connectors/ConnectorPage.jsx",
  [PageKeys.CONNECTOR_PAGE_ID]:
    "./components/Integration/connectors/ConnectorPage.jsx",
  [PageKeys.API_TOKENS]: "./components/Apikeys/Apikeys.jsx",
  [PageKeys.INVITE_TEAM]: "./components/InviteTeam/index.jsx",
  [PageKeys.SUPPORT]: "./components/Support/index.jsx",
  [PageKeys.NOT_FOUND]: "./pages/NotFound/index.jsx",
};
