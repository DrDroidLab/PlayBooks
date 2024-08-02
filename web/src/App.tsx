import Layout from "./Layout";
import { Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import "nprogress/nprogress.css";
import { useGetUserQuery } from "./store/features/auth/api";
import Loading from "./components/common/Loading";
import {
  generateNoLayoutRoutes,
  generateOtherRoutes,
  generateUnauthRoutes,
} from "./generateRoutes";
import useDefaultPage from "./hooks/useDefaultPage";

const App = () => {
  useDefaultPage();
  const { isLoading } = useGetUserQuery();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      {generateUnauthRoutes()}

      <Route element={<RequireAuth />}>{generateNoLayoutRoutes()}</Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>{generateOtherRoutes()}</Route>
      </Route>
    </Routes>
  );
};

export default App;
