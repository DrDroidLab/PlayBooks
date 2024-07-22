import { Box, Typography } from "@mui/material";
import React from "react";
import { LinkStyled } from "./LinkStyled.tsx";
import { AuthProviders } from "../utils/AuthProviders.ts";
import { useGetLoginProvidersQuery } from "../../../store/features/auth/api/getLoginProvidersApi.ts";
import ForgotPasswordBox from "./ForgotPasswordBox.tsx";

function LoginAdditionalData() {
  const { data } = useGetLoginProvidersQuery();

  return (
    <div className="my-2">
      {data?.includes(AuthProviders.EMAIL) && <ForgotPasswordBox />}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
        <Typography variant="body2">Don't have an account?&nbsp;</Typography>
        <Typography variant="body2">
          <LinkStyled to="/signup">Sign up</LinkStyled>
        </Typography>
      </Box>
    </div>
  );
}

export default LoginAdditionalData;
