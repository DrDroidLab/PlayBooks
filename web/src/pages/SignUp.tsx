import "../css/SignUp.css";
import { CircularProgress } from "@mui/material";
import SocialSignIn from "../components/Auth/SocialSignIn/index.tsx";
import SignupAdditionalData from "../components/Auth/AdditonalData/SignupAdditionalData.tsx";
import EmailPasswordSignupForm from "../components/Auth/EmailPassword/EmailPasswordSignupForm.tsx";
import { AuthProviders } from "../components/Auth/utils/AuthProviders.ts";
import { useGetLoginProvidersQuery } from "../store/features/auth/api/getLoginProvidersApi.ts";
import NoProviders from "../components/Auth/Common/NoProviders.tsx";

function SignUp() {
  const { data, isLoading } = useGetLoginProvidersQuery();

  return (
    <main className="bg-gray-50 w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-1 bg-white shadow-md p-4 rounded-xl w-3/12">
        <img
          src="/logo/drdroid-logo-full.png"
          alt="DrDroid Logo"
          className="w-64 max-w-xs"
        />

        <NoProviders />

        {isLoading && (
          <div className="flex items-center justify-center">
            <CircularProgress size={20} color="primary" />
          </div>
        )}

        {data?.includes(AuthProviders.EMAIL) && <EmailPasswordSignupForm />}
        <SocialSignIn />
        <SignupAdditionalData />
      </div>
    </main>
  );
}

export default SignUp;
