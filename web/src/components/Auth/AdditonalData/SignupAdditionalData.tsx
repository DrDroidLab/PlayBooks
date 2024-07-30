import { Box, Typography } from "@mui/material";
import { useGetLoginProvidersQuery } from "../../../store/features/auth/api/getLoginProvidersApi.ts";
import { AuthProviders } from "../utils/AuthProviders.ts";
import { Link } from "react-router-dom";

function SignupAdditionalData() {
  const { data } = useGetLoginProvidersQuery();
  const emailEnabled = data?.includes(AuthProviders.EMAIL);

  return (
    <div className="my-2">
      <div className="text-xs text-center">
        By signing up, you are agreeing to our{" "}
        <Link
          className="text-violet-500 hover:underline"
          target="_blank"
          to="https://docs.drdroid.io/docs/terms-of-use">
          terms
        </Link>
        <span> and </span>
        <Link
          className="text-violet-500 hover:underline"
          target="_blank"
          to="https://docs.drdroid.io/docs/privacy-policy">
          privacy policy
        </Link>
        <span>.</span>
      </div>
      <br />
      {emailEnabled && (
        <div className="text-xs text-center">
          Already have an account?{" "}
          <Link className="text-violet-500 hover:underline" to="/login">
            Sign in
          </Link>
        </div>
      )}

      <p className="text-xs text-center mt-1 text-gray-600">
        Optimised for desktop usage only
      </p>
    </div>
  );
}

export default SignupAdditionalData;
