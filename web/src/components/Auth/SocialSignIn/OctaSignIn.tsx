import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Tooltip } from "@mui/material";

function OctaSignIn() {
  const handleOcta = () => {};

  return (
    <CustomButton
      onClick={handleOcta}
      className="rounded-full w-fit !border-gray-200 hover:!bg-gray-200">
      <Tooltip title="Sign in with Okta">
        <img src="/logo/okta-logo.svg" alt="Okta Logo" width={25} height={25} />
      </Tooltip>
    </CustomButton>
  );
}

export default OctaSignIn;
