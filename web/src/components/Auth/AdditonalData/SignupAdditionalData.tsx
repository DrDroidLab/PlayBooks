import { Box, Typography } from "@mui/material";
import React from "react";
import { LinkStyled } from "./LinkStyled.tsx";
import { useGetLoginProvidersQuery } from "../../../store/features/auth/api/getLoginProvidersApi.ts";
import { AuthProviders } from "../utils/AuthProviders.ts";

function SignupAdditionalData() {
  const { data } = useGetLoginProvidersQuery();
  const emailEnabled = data?.includes(AuthProviders.EMAIL);

  return (
    <div className="my-2">
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          color: "grey",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Typography variant="body2">
          By signing up, you are agreeing to our&nbsp;
        </Typography>
        <Typography variant="body2">
          <LinkStyled
            target="_blank"
            to="https://docs.drdroid.io/docs/terms-of-use">
            terms
          </LinkStyled>
          <span>&nbsp;and&nbsp;</span>
        </Typography>
        <Typography variant="body2">
          <LinkStyled
            target="_blank"
            to="https://docs.drdroid.io/docs/privacy-policy">
            privacy policy
          </LinkStyled>
          <span>.</span>
        </Typography>
      </Box>

      <br />

      {emailEnabled && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
          <Typography variant="body2">
            Already have an account? &nbsp;
          </Typography>
          <Typography variant="body2">
            <LinkStyled to="/login">Sign in</LinkStyled>
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          color: "grey",
        }}>
        <Typography variant="body2">
          Optimised for desktop usage only
        </Typography>
      </Box>
    </div>
  );
}

export default SignupAdditionalData;
