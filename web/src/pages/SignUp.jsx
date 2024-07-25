import React from "react";
import "../css/SignUp.css";
import Box from "@mui/material/Box";
import { CardContent, CircularProgress } from "@mui/material";
import SocialSignIn from "../components/Auth/SocialSignIn/index.tsx";
import SignupAdditionalData from "../components/Auth/AdditonalData/SignupAdditionalData.tsx";
import EmailPasswordSignupForm from "../components/Auth/EmailPassword/EmailPasswordSignupForm.tsx";
import { Card, BlankLayoutWrapper } from "../components/Auth/Common/index.tsx";
import { AuthProviders } from "../components/Auth/utils/AuthProviders.ts";
import { useGetLoginProvidersQuery } from "../store/features/auth/api/getLoginProvidersApi.ts";
import NoProviders from "../components/Auth/Common/NoProviders.tsx";

function SignUp() {
  const { data, isLoading } = useGetLoginProvidersQuery();

  return (
    <div className="container">
      <BlankLayoutWrapper className="half-width">
        <Box
          className="app-content"
          sx={{
            minHeight: "100vh",
            overflowX: "hidden",
            position: "relative",
            backgroundColor: "#F4F5FA",
          }}>
          <Box className="content-center">
            <Card sx={{ zIndex: 1 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    margin: "25px",
                  }}>
                  <img
                    src={"/logo/drdroid-logo-full.png"}
                    width="200px"
                    alt="Your logo"
                  />
                </Box>

                <NoProviders />

                {isLoading && (
                  <div className="flex items-center justify-center">
                    <CircularProgress size={20} color="primary" />
                  </div>
                )}

                {data?.includes(AuthProviders.EMAIL) && (
                  <EmailPasswordSignupForm />
                )}
                <SocialSignIn />
                <SignupAdditionalData />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </BlankLayoutWrapper>
    </div>
  );
}

export default SignUp;
