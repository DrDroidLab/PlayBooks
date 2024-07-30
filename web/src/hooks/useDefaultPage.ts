import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  selectAccessToken,
  selectEmail,
  setLastLogin,
} from "../store/features/auth/authSlice";
import { useGetUserQuery } from "../store/features/auth/api";
import { isUnAuth } from "../utils/auth/unauthenticatedRoutes";
import posthog from "posthog-js";

function useDefaultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = useSelector(selectEmail);
  const accessToken = useSelector(selectAccessToken);
  const { data, isError } = useGetUserQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (email) {
      posthog.identify(email);
    }
  }, [email]);

  useEffect(() => {
    if (!data && isError && !isUnAuth) {
      navigate("/signup", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [data, isError, accessToken]);

  useEffect(() => {
    const loader = document.querySelector(
      ".loader-container",
    ) as HTMLDivElement;
    if (loader) {
      loader.style.display = "none";
    }
  }, []);

  useEffect(() => {
    if (data?.user) {
      const d = new Date().toString();
      dispatch(setLastLogin(d));
      localStorage.setItem("lastLogin", d);
    }
  }, [data]);
}

export default useDefaultPage;
