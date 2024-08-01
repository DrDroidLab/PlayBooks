import { PageKeys } from "./pageKeys";

// Dynamically import each component using functions
export const components = {
  [PageKeys.LOGIN]: () => import("./pages/auth/Login"),
  [PageKeys.SIGNUP]: () => import("./pages/auth/SignUp"),
  [PageKeys.RESET_PASSWORD]: () => import("./pages/auth/ResetPassword"),
  [PageKeys.OAUTH_CALLBACK]: () => import("./pages/auth/OAuthCallback"),
  [PageKeys.PLAYBOOKS_CREATE]: () => import("./pages/playbooks/Playbook"),
  [PageKeys.PLAYBOOK_VIEW]: () => import("./pages/playbooks/Playbook"),
  [PageKeys.PLAYBOOK_LOGS]: () => import("./pages/playbooks/PlaybookLog"),
  [PageKeys.PLAYBOOK_EDIT]: () => import("./pages/playbooks/Playbook"),
  [PageKeys.HOME]: () => import("./pages/playbooks"),
  [PageKeys.PLAYBOOKS]: () => import("./pages/playbooks/index"),
  [PageKeys.PLAYBOOK_EXECUTIONS_LIST]: () =>
    import("./pages/playbooks/PlaybookExecutions"),
  [PageKeys.PLAYBOOK_EXECUTIONS]: () =>
    import("./pages/playbooks/PlaybookExecutions"),
  [PageKeys.WORKFLOWS_CREATE]: () => import("./pages/workflows/CreateWorkflow"),
  [PageKeys.WORKFLOWS]: () => import("./pages/workflows"),
  [PageKeys.WORKFLOW_VIEW]: () => import("./pages/workflows/CreateWorkflow"),
  [PageKeys.WORKFLOW_EXECUTIONS]: () =>
    import("./pages/workflows/WorkflowExecutions"),
  [PageKeys.WORKFLOW_EXECUTIONS_LIST]: () =>
    import("./pages/workflows/WorkflowExecutionList"),
  [PageKeys.WORKFLOW_EXECUTION_LOGS]: () =>
    import("./pages/workflows/WorkflowExecutionLogs"),
  [PageKeys.PLAYGROUND]: () => import("./pages/playgrounds"),
  [PageKeys.DATA_SOURCES]: () => import("./pages/integrations"),
  [PageKeys.INTEGRATIONS_ADD]: () =>
    import("./pages/integrations/AddIntegration"),
  [PageKeys.CONNECTOR_PAGE]: () => import("./pages/integrations/ConnectorPage"),
  [PageKeys.CONNECTOR_PAGE_ID]: () =>
    import("./pages/integrations/ConnectorPage"),
  [PageKeys.API_TOKENS]: () => import("./pages/Apikeys"),
  [PageKeys.INVITE_TEAM]: () => import("./pages/InviteTeam"),
  [PageKeys.SUPPORT]: () => import("./pages/Support"),
  [PageKeys.NOT_FOUND]: () => import("./pages/NotFound"),
  [PageKeys.SETTINGS]: () => import("./pages/Settings"),
  [PageKeys.DYNAMIC_ALERTS]: () => import("./pages/dynamicAlerts"),
  [PageKeys.CREATE_DYNAMIC_ALERTS]: () =>
    import("./pages/dynamicAlerts/CreateDynamicAlert"),
};
