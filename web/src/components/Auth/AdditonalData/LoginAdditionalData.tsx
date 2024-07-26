import { AuthProviders } from "../utils/AuthProviders.ts";
import { useGetLoginProvidersQuery } from "../../../store/features/auth/api/getLoginProvidersApi.ts";
import ForgotPasswordBox from "./ForgotPasswordBox.tsx";
import { Link } from "react-router-dom";

function LoginAdditionalData() {
  const { data } = useGetLoginProvidersQuery();

  if (!data?.includes(AuthProviders.EMAIL)) return;

  return (
    <div className="my-2">
      <ForgotPasswordBox />
      <div className="flex items-center gap-1 text-sm justify-center">
        Don't have an account?
        <Link className="text-violet-500 hover:underline" to="/signup">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default LoginAdditionalData;
