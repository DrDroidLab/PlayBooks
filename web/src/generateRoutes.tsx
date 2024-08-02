import { createElement, lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { components } from "./components";
import { unAuthPages } from "./utils/pages/unAuthPages";
import { PageKeys } from "./pageKeys";
import { noLayoutPages } from "./utils/pages/noLayoutPages";
import { routes } from "./routes";
import Loading from "./components/common/Loading";

const LazyComponent = ({ importFn }) => (
  <Suspense fallback={<Loading />}>{createElement(lazy(importFn))}</Suspense>
);

export const generateNoLayoutRoutes = () => {
  return Object.entries(components)
    .filter(([pageKey]) => noLayoutPages.includes(pageKey as PageKeys))
    .map(([pageKey, importFn]) => (
      <Route
        key={pageKey}
        path={routes[pageKey]}
        element={<LazyComponent importFn={importFn} />}
      />
    ));
};

export const generateOtherRoutes = () => {
  return Object.entries(components)
    .filter(
      ([pageKey]) =>
        !noLayoutPages.includes(pageKey as PageKeys)
    )
    .map(([pageKey, importFn]) => (
      <Route
        key={pageKey}
        path={routes[pageKey]}
        element={<LazyComponent importFn={importFn} />}
      />
    ));
};
