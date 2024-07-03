import React from "react";
import { useGetLoginProvidersQuery } from "../../../store/features/auth/api/getLoginProvidersApi.ts";
import { oAuthProviders } from "./oauthProvidersButtons.tsx";

function SocialSignIn() {
  const { data } = useGetLoginProvidersQuery();

  if (data?.length === 0) return;

  return (
    <div className="my-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <hr className="flex-1 rounded" />
        <span className="font-semibold text-xs">OR</span>
        <hr className="flex-1 rounded" />
      </div>

      <div className="flex items-center justify-center">
        {data?.map((e: string) => oAuthProviders[e])}
      </div>
    </div>
  );
}

export default SocialSignIn;
