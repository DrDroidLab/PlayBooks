import { createElement, lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { components } from "./components";
import { unAuthPages } from "./utils/pages/unAuthPages";
import { PageKeys } from "./pageKeys";
import { noLayoutPages } from "./utils/pages/noLayoutPages";
import { routes } from "./routes";
import Loading from "./components/common/Loading";
import AnimatedRoute from "./components/AnimatedRoute";
import { unsupportedAnimationPages } from "./utils/pages/unsupportedAnimationPages";

type LazyComponentProps = {
  importFn: () => Promise<{ default: any }>;
  pageKey?: string;
};

const LazyComponent = ({ importFn, pageKey }: LazyComponentProps) => (
  <Suspense fallback={<Loading />}>
    {unsupportedAnimationPages.includes(pageKey as PageKeys) ? (
      createElement(lazy(importFn))
    ) : (
      <AnimatedRoute>{createElement(lazy(importFn))}</AnimatedRoute>
    )}
  </Suspense>
);

export const generateUnauthRoutes = () => {
  return Object.entries(components)
    .filter(([pageKey]) => unAuthPages.includes(pageKey as PageKeys))
    .map(([pageKey, importFn]) => (
      <Route
        key={pageKey}
        path={routes[pageKey]}
        element={<LazyComponent importFn={importFn} />}
      />
    ));
};

// export const generateNoLayoutRoutes = () => {
//   return Object.entries(components)
//     .filter(([pageKey]) => noLayoutPages.includes(pageKey as PageKeys))
//     .map(([pageKey, importFn]) => (
//       <Route
//         key={pageKey}
//         path={routes[pageKey]}
//         element={<LazyComponent importFn={importFn} />}
//       />
//     ));
// };

export const generateOtherRoutes = () => {
  return Object.entries(components)
    .filter(
      ([pageKey]) =>
        // !noLayoutPages.includes(pageKey as PageKeys) &&
        !unAuthPages.includes(pageKey as PageKeys),
    )
    .map(([pageKey, importFn]) => (
      <Route
        key={pageKey}
        path={routes[pageKey]}
        element={<LazyComponent importFn={importFn} pageKey={pageKey} />}
      />
    ));
};
