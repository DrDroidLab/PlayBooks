import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../store/features/auth/authSlice.ts";
import FakeLoading from "./common/Loading/FakeLoading.tsx";

const RequireAuth = () => {
  const accessToken = useSelector(selectAccessToken);
  const location = useLocation();

  return (
    <>
      <FakeLoading />
      {accessToken ? (
        <Outlet />
      ) : (
        <Navigate to="/signup" state={{ from: location }} replace />
      )}
    </>
  );
};

export default RequireAuth;
