import { routes } from "@/routes";
import { unauthenticatedRoutes } from "./unauthenticatedRoutes";
import { PageKeys } from "@/pageKeys";

export const authenticatedRoutes: (typeof routes)[keyof typeof routes][] =
  Object.keys(routes).filter(
    (key) =>
      !unauthenticatedRoutes.includes(routes[key]) &&
      key !== PageKeys.NOT_FOUND,
  );
