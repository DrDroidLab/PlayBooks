import { PageKeys } from "./pageKeys.ts";

export const components = {
  [PageKeys.LOGIN]: "./pages/Login",
  [PageKeys.SIGNUP]: "./pages/SignUp",
  [PageKeys.RESET_PASSWORD]: "./pages/ResetPassword",
  [PageKeys.OAUTH_CALLBACK]: "./pages/OAuthCallback",
  [PageKeys.PLAYBOOKS_CREATE]: "./pages/Playbook",
  [PageKeys.PLAYBOOK_VIEW]: "./pages/Playbook",
  [PageKeys.PLAYBOOK_LOGS]: "./components/Playbooks/logs/index",
  [PageKeys.PLAYBOOK_EDIT]: "./pages/Playbook",
  [PageKeys.HOME]: "./components/Playbooks/index",
  [PageKeys.SETTINGS]: "./pages/Settings.tsx",
  [PageKeys.PLAYBOOKS]: "./pages/Playbooks",
  [PageKeys.PLAYBOOK_EXECUTIONS_LIST]:
    "./components/Playbooks/executions/PlaybookExecutionsList",
  [PageKeys.PLAYBOOK_EXECUTIONS]:
    "./components/Playbooks/executions/PlaybookExecutions",
  [PageKeys.WORKFLOWS_CREATE]: "./components/Workflows/create/CreateWorkflow",
  [PageKeys.WORKFLOWS]: "./components/Workflows/index",
  [PageKeys.WORKFLOW_VIEW]: "./components/Workflows/create/CreateWorkflow",
  [PageKeys.WORKFLOW_EXECUTIONS]:
    "./components/Workflows/executions/WorkflowExecutions",
  [PageKeys.WORKFLOW_EXECUTIONS_LIST]:
    "./components/Workflows/executions/WorkflowExecutionList",
  [PageKeys.WORKFLOW_EXECUTION_LOGS]:
    "./components/Workflows/executions/WorkflowExecutionLogs",
  [PageKeys.PLAYGROUND]: "./components/Playgrounds/index",
  [PageKeys.INTEGRATIONS_ADD]: "./components/Integration/index",
  [PageKeys.DATA_SOURCES]: "./pages/DataSources.tsx",
  [PageKeys.CONNECTOR_PAGE]:
    "./components/Integration/connectors/ConnectorPage",
  [PageKeys.CONNECTOR_PAGE_ID]:
    "./components/Integration/connectors/ConnectorPage",
  [PageKeys.API_TOKENS]: "./components/Apikeys/Apikeys",
  [PageKeys.INVITE_TEAM]: "./components/InviteTeam/index",
  [PageKeys.SUPPORT]: "./components/Support/index",
  [PageKeys.NOT_FOUND]: "./pages/NotFound/index",
};
