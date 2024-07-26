import { PageKeys } from "./pageKeys.ts";

export const components = {
  [PageKeys.LOGIN]: "./pages/Login",
  [PageKeys.SIGNUP]: "./pages/SignUp",
  [PageKeys.RESET_PASSWORD]: "./pages/ResetPassword",
  [PageKeys.OAUTH_CALLBACK]: "./pages/OAuthCallback",
  [PageKeys.PLAYBOOKS_CREATE]: "./pages/Playbook",
  [PageKeys.PLAYBOOK_VIEW]: "./pages/Playbook",
  [PageKeys.PLAYBOOK_LOGS]: "./pages/PlaybookLog",
  [PageKeys.PLAYBOOK_EDIT]: "./pages/Playbook",
  [PageKeys.HOME]: "./pages/Playbooks",
  [PageKeys.SETTINGS]: "./pages/Settings",
  [PageKeys.PLAYBOOKS]: "./pages/Playbooks",
  [PageKeys.PLAYBOOK_EXECUTIONS_LIST]: "./pages/PlaybookExecutions",
  [PageKeys.PLAYBOOK_EXECUTIONS]:
    "./components/Playbooks/executions/PlaybookExecutions",
  [PageKeys.WORKFLOWS_CREATE]: "./pages/CreateWorkflow",
  [PageKeys.WORKFLOWS]: "./pages/Workflows",
  [PageKeys.WORKFLOW_VIEW]: "./pages/CreateWorkflow",
  [PageKeys.WORKFLOW_EXECUTIONS]: "./pages/WorkflowExecutions",
  [PageKeys.WORKFLOW_EXECUTIONS_LIST]: "./pages/WorkflowExecutionList",
  [PageKeys.WORKFLOW_EXECUTION_LOGS]: "./pages/WorkflowExecutionLogs",
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
