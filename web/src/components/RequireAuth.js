import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../store/features/auth/authSlice.ts";

const RequireAuth = () => {
  const accessToken = useSelector(selectAccessToken);
  const location = useLocation();

  return accessToken ? (
    <Outlet />
  ) : (
    <Navigate to="/signup" state={{ from: location }} replace />
  );
};

export default RequireAuth;
