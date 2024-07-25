import { createElement, lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { components } from "./components";
import { unAuthPages } from "./utils/unAuthPages";
import { PageKeys } from "./pageKeys";
import { noLayoutPages } from "./utils/noLayoutPages";
import { routes } from "./routes";
import Loading from "./components/common/Loading";

const LazyComponent = ({ path }) => (
  <Suspense fallback={<Loading />}>
    {createElement(lazy(() => import(/* @vite-ignore */ path)))}
  </Suspense>
);

export const generateUnauthRoutes = () => {
  return Object.entries(components)
    .filter(([pageKey]) => unAuthPages.includes(pageKey as PageKeys))
    .map(([pageKey, path]) => (
      <Route
        key={pageKey}
        path={routes[pageKey]}
        element={<LazyComponent path={path} />}
      />
    ));
};

export const generateNoLayoutRoutes = () => {
  return Object.entries(components)
    .filter(([pageKey]) => noLayoutPages.includes(pageKey as PageKeys))
    .map(([pageKey, path]) => (
      <Route
        key={pageKey}
        path={routes[pageKey]}
        element={<LazyComponent path={path} />}
      />
    ));
};

export const generateOtherRoutes = () => {
  return Object.entries(components)
    .filter(
      ([pageKey]) =>
        !noLayoutPages.includes(pageKey as PageKeys) &&
        !unAuthPages.includes(pageKey as PageKeys),
    )
    .map(([pageKey, path]) => (
      <Route
        key={pageKey}
        path={routes[pageKey]}
        element={<LazyComponent path={path} />}
      />
    ));
};
