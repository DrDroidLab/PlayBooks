/* eslint-disable react-hooks/exhaustive-deps */
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";

import "../Layout.css";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const verifyRefreshfToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    !auth?.accessToken ? verifyRefreshfToken() : setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading ? (
        <div id="pre-loader">
          <img src="/logo/logo.png" alt="Dr. Droid" size="width: 50px" />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin;
