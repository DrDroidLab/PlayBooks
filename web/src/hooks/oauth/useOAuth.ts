import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { showSnackbar } from "../../store/features/snackbar/snackbarSlice.ts";
import { useEffect } from "react";
import useOkta from "./useOkta.ts";

const OAuthTypes = {
  OKTA: "okta",
};

function useOAuth() {
  const { oauthId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const triggerOktaOAuth = useOkta();

  const handleOAuth = () => {
    switch (oauthId) {
      case OAuthTypes.OKTA:
        triggerOktaOAuth();
        break;

      default:
        navigate("/signup", {
          replace: true,
        });
        dispatch(showSnackbar("Unsupported OAuth provider"));
    }
  };

  useEffect(() => {
    if (oauthId) {
      handleOAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthId]);
}

export default useOAuth;
