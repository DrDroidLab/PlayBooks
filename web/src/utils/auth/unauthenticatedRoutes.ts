export const unauthenticatedRoutes = ["/signup", "/login", "/oauth/callback/*"];

const pathToRegex = (path) => {
  return new RegExp(
    "^" + path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*"),
  );
};

export const isUnAuth = unauthenticatedRoutes.some((route) =>
  pathToRegex(route).test(window.location.pathname),
);
