import { API_URL, REFRESH_TOKEN } from "../../constants/index.ts";

export async function refreshToken() {
  const response = await fetch(API_URL + REFRESH_TOKEN, { method: "POST" });
  if (!response.ok) throw new Error("Token refresh failed");
  return await response.json();
}
