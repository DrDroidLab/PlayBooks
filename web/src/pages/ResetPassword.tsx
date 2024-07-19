import React from "react";
import CustomButton from "../components/common/CustomButton/index.tsx";
import { useNavigate } from "react-router-dom";
import { ChevronLeftRounded } from "@mui/icons-material";

function ResetPassword() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <main className="bg-gray-50 w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-5 bg-white shadow-md p-8 rounded-xl">
        <img
          src="/logo/drdroid-logo-full.png"
          alt="DrDroid Logo"
          className="w-64 max-w-xs"
        />
        <p>Ask your administrator to reset your password.</p>
        <CustomButton
          className="!bg-violet-500 !text-white !text-base w-full !justify-center hover:!bg-transparent hover:!text-violet-500 p-3 font-normal"
          onClick={goToLogin}>
          <ChevronLeftRounded /> Back to Login
        </CustomButton>
      </div>
    </main>
  );
}

export default ResetPassword;
