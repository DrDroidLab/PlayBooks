import { useNavigate, useSearchParams } from "react-router-dom";
import { useOktaOAuthMutation } from "../../store/features/auth/api/index.ts";

function useOkta() {
  const navigate = useNavigate();
  const [triggerOktaOAuth] = useOktaOAuthMutation();
  const [searchParams] = useSearchParams();

  const triggerAuth = async () => {
    await triggerOktaOAuth(searchParams.toString());
    navigate("/");
  };

  return triggerAuth;
}

export default useOkta;
