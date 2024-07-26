import Layout from "./Layout.jsx";
import BaseLayout from "./BaseLayout";
import { Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth.jsx";
import "nprogress/nprogress.css";
import { useGetUserQuery } from "./store/features/auth/api/getUserApi.ts";
import Loading from "./components/common/Loading/index.tsx";
import {
  generateNoLayoutRoutes,
  generateOtherRoutes,
  generateUnauthRoutes,
} from "./generateRoutes.tsx";
import useDefaultPage from "./hooks/useDefaultPage.ts";

const App = () => {
  useDefaultPage();
  const { isLoading } = useGetUserQuery();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route element={<BaseLayout />}>{generateUnauthRoutes()}</Route>

      <Route element={<RequireAuth />}>{generateNoLayoutRoutes()}</Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>{generateOtherRoutes()}</Route>
      </Route>
    </Routes>
  );
};

export default App;
