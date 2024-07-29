import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectAccessToken,
  selectLastLogin,
} from "../store/features/auth/authSlice.ts";
import FakeLoading from "./common/Loading/FakeLoading.tsx";
import RecieveUpdatesModal from "./Modals/RecieveUpdatesModal/index.tsx";
import useToggle from "../hooks/common/useToggle.js";

const RequireAuth = () => {
  const accessToken = useSelector(selectAccessToken);
  const lastLogin = useSelector(selectLastLogin);
  const location = useLocation();
  const { isOpen, toggle } = useToggle(true);

  return (
    <>
      <FakeLoading />
      {accessToken ? (
        <Outlet />
      ) : (
        <Navigate to="/signup" state={{ from: location }} replace />
      )}

      {!lastLogin && <RecieveUpdatesModal close={toggle} isOpen={isOpen} />}
    </>
  );
};

export default RequireAuth;
