import { routes } from "@/routes";

export enum pathNameValues {
  OAUTH_ID = "oauthId",
  PLAYBOOK_ID = "playbook_id",
  ID = "id",
  WORKFLOW_RUN_ID = "workflow_run_id",
  CONNECTOR_ENUM = "connectorEnum",
}

export const replaceRouteParam = (
  route: (typeof routes)[keyof typeof routes],
  paramName: pathNameValues,
  value: string,
): string => {
  const regex = new RegExp(`:${paramName}`, "g");
  return route.replace(regex, value);
};
