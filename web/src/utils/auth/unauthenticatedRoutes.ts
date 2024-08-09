import { routes } from "@/routes";
import { pathNameValues, replaceRouteParam } from "../common/replaceRouteParam";

export const unauthenticatedRoutes: (typeof routes)[keyof typeof routes][] = [
  routes.SIGNUP,
  routes.LOGIN,
  replaceRouteParam(routes.OAUTH_CALLBACK, pathNameValues.OAUTH_ID, "*"),
  routes.RESET_PASSWORD,
  routes.PLAYGROUND,
];

export const pathToRegex = (path: string): RegExp => {
  return new RegExp(
    "^" + path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*"),
  );
};

export const isUnAuth = (path: string) =>
  unauthenticatedRoutes.some((route) => pathToRegex(route).test(path));
