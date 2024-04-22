import { store } from "../store";
import { initializeAuth } from "../store/features/auth/authSlice";

export function loadCredentials() {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const email = localStorage.getItem("email");
  store.dispatch(initializeAuth({ accessToken, refreshToken, email }));
}
