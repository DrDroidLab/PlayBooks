import { CircularProgress } from "@mui/material";
import React from "react";

function OAuthCallback() {
  return (
    <main className="flex items-center justify-center w-screen h-screen">
      <div className="shadow-md rounded p-4 flex items-center flex-col gap-4">
        <img
          src={"/logo/drdroid-logo-full.png"}
          width={200}
          alt="DrDroid Logo"
        />
        <p className="font-medium text-center">
          Please wait while we sign you in
        </p>
        <CircularProgress />
      </div>
    </main>
  );
}

export default OAuthCallback;
