import "../css/Login.css";
import Box from "@mui/material/Box";
import { CardContent, CircularProgress } from "@mui/material";
import EmailPasswordLoginForm from "../components/Auth/EmailPassword/EmailPasswordLoginForm.tsx";
import LoginAdditionalData from "../components/Auth/AdditonalData/LoginAdditionalData.tsx";
import SocialSignIn from "../components/Auth/SocialSignIn/index.tsx";
import { useGetLoginProvidersQuery } from "../store/features/auth/api/getLoginProvidersApi.ts";
import { AuthProviders } from "../components/Auth/utils/AuthProviders.ts";
import { Card, BlankLayoutWrapper } from "../components/Auth/Common/index.tsx";
import NoProviders from "../components/Auth/Common/NoProviders.tsx";

function Login() {
  const { data, isLoading } = useGetLoginProvidersQuery();

  return (
    <>
      <BlankLayoutWrapper className="layout-wrapper">
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
                    margin: "30px",
                  }}>
                  <img
                    src={"/logo/drdroid-logo-full.png"}
                    width={200}
                    alt="DrDroid Logo"
                  />
                </Box>

                {isLoading && (
                  <div className="flex items-center justify-center">
                    <CircularProgress size={20} color="primary" />
                  </div>
                )}

                <NoProviders />

                {data?.includes(AuthProviders.EMAIL) && (
                  <EmailPasswordLoginForm />
                )}
                <SocialSignIn />
                <LoginAdditionalData />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </BlankLayoutWrapper>
    </>
  );
}

export default Login;
