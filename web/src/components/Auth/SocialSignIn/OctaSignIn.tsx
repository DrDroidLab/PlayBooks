import { useState } from "react";
import { useRedirectUriMutation } from "../../../store/features/auth/api/redirectUriApi.ts";
import Loading from "../../common/Loading/index.tsx";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Toast } from "../../Toast.jsx";

function OctaSignIn() {
  const [getRedirectUri, { isLoading }] = useRedirectUriMutation();
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

  const handleOcta = async (e: any) => {
    e.preventDefault();
    try {
      const data = await getRedirectUri("okta").unwrap();
      window.open(data.redirect_uri, "_self");
    } catch (err: any) {
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
        className="rounded-full w-fit !border-gray-200 hover:!bg-gray-200 !text-black uppercase gap-2">
        <img src="/logo/okta-logo.svg" alt="Okta Logo" width={25} height={25} />
        <span>Sign in with Okta</span>
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
