import { REFRESH_TOKEN } from "../../constants/index.ts";

export async function refreshToken() {
  const response = await fetch(window.location.origin + REFRESH_TOKEN, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Token refresh failed");
  const result = await response.json();

  return result;
}
