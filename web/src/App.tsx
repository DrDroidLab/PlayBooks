import Layout from "./Layout";
import { Route, Routes, useLocation } from "react-router-dom";
import "nprogress/nprogress.css";
import { useGetUserQuery } from "./store/features/auth/api";
import Loading from "./components/common/Loading";
import { generateNoLayoutRoutes, generateOtherRoutes } from "./generateRoutes";
import useDefaultPage from "./hooks/useDefaultPage";

const App = () => {
  useDefaultPage();
  const { isLoading } = useGetUserQuery();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes key={location.pathname} location={location}>
      {generateNoLayoutRoutes()}
      <Route element={<Layout />}>{generateOtherRoutes()}</Route>
    </Routes>
  );
};

export default App;
