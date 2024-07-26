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
    <main className="bg-gray-50 w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-1 bg-white shadow-md p-6 rounded-xl w-3/12">
        <img
          src="/logo/drdroid-logo-full.png"
          alt="DrDroid Logo"
          className="w-64 max-w-xs"
        />

        {isLoading && (
          <div className="flex items-center justify-center">
            <CircularProgress size={20} color="primary" />
          </div>
        )}

        <NoProviders />

        {data?.includes(AuthProviders.EMAIL) && <EmailPasswordLoginForm />}
        <SocialSignIn />
        <LoginAdditionalData />
      </div>
    </main>
  );
}

export default Login;
