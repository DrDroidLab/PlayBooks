import React, { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Tooltip } from "@mui/material";
import { useOktaLoginMutation } from "../../../store/features/auth/api/oktaLoginApi.ts";
import Toast from "../../Toast.js";
import Loading from "../../common/Loading/index.tsx";

function OctaSignIn() {
  const [triggerLoginWithOkta, { isLoading }] = useOktaLoginMutation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleOpenToast = (msg: string, toastType: string) => {
    setToastMsg(msg);
    setToastType(toastType);
    setToastOpen(true);
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  const handleOcta = async (e) => {
    e.preventDefault();
    try {
      const data = await triggerLoginWithOkta().unwrap();
      window.open(data.redirect_uri, "_self");
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        handleOpenToast("No Server Response", "error");
      } else if (err.response?.status === 400) {
        handleOpenToast(err.response?.data?.non_field_errors[0], "error");
      } else if (err.response?.status === 401) {
        handleOpenToast("Unauthorized", "error");
      } else {
        handleOpenToast("Login Failed", "error");
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <CustomButton
        onClick={handleOcta}
        className="rounded-full w-fit !border-gray-200 hover:!bg-gray-200">
        <Tooltip title="Sign in with Okta">
          <img
            src="/logo/okta-logo.svg"
            alt="Okta Logo"
            width={25}
            height={25}
          />
        </Tooltip>
      </CustomButton>

      <Toast
        open={toastOpen}
        handleClose={handleCloseToast}
        message={toastMsg}
        severity={toastType}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </>
  );
}

export default OctaSignIn;
