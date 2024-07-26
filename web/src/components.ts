import { PageKeys } from "./pageKeys.ts";

export const components = {
  [PageKeys.LOGIN]: "./pages/auth/Login",
  [PageKeys.SIGNUP]: "./pages/auth/SignUp",
  [PageKeys.RESET_PASSWORD]: "./pages/auth/ResetPassword",
  [PageKeys.OAUTH_CALLBACK]: "./pages/auth/OAuthCallback",
  [PageKeys.PLAYBOOKS_CREATE]: "./pages/playbooks/Playbook",
  [PageKeys.PLAYBOOK_VIEW]: "./pages/playbooks/Playbook",
  [PageKeys.PLAYBOOK_LOGS]: "./pages/playbooks/PlaybookLog",
  [PageKeys.PLAYBOOK_EDIT]: "./pages/playbooks/Playbook",
  [PageKeys.HOME]: "./pages/playbooks",
  [PageKeys.PLAYBOOKS]: "./pages/playbooks/Playbooks",
  [PageKeys.PLAYBOOK_EXECUTIONS_LIST]: "./pages/playbooks/PlaybookExecutions",
  [PageKeys.SETTINGS]: "./pages/Settings",
  [PageKeys.PLAYBOOK_EXECUTIONS]:
    "./components/Playbooks/executions/PlaybookExecutions",
  [PageKeys.WORKFLOWS_CREATE]: "./pages/workflows/CreateWorkflow",
  [PageKeys.WORKFLOWS]: "./pages/workflows",
  [PageKeys.WORKFLOW_VIEW]: "./pages/workflows/CreateWorkflow",
  [PageKeys.WORKFLOW_EXECUTIONS]: "./pages/workflows/WorkflowExecutions",
  [PageKeys.WORKFLOW_EXECUTIONS_LIST]:
    "./pages/workflows/WorkflowExecutionList",
  [PageKeys.WORKFLOW_EXECUTION_LOGS]: "./pages/workflows/WorkflowExecutionLogs",
  [PageKeys.PLAYGROUND]: "./components/Playgrounds/index",
  [PageKeys.DATA_SOURCES]: "./pages/integrations",
  [PageKeys.INTEGRATIONS_ADD]: "./pages/integrations/AddIntegration",
  [PageKeys.CONNECTOR_PAGE]: "./pages/integrations/ConnectorPage",
  [PageKeys.CONNECTOR_PAGE_ID]: "./pages/integrations/ConnectorPage",
  [PageKeys.API_TOKENS]: "./components/Apikeys/Apikeys",
  [PageKeys.INVITE_TEAM]: "./components/InviteTeam/index",
  [PageKeys.SUPPORT]: "./components/Support/index",
  [PageKeys.NOT_FOUND]: "./pages/NotFound/index",
};
