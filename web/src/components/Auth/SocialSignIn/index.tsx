import React from "react";
import OctaSignIn from "./OctaSignIn.tsx";

function SocialSignIn() {
  return (
    <div className="my-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <hr className="flex-1 rounded" />
        <span className="font-semibold text-xs">OR</span>
        <hr className="flex-1 rounded" />
      </div>

      <div className="flex items-center justify-center">
        <OctaSignIn />
      </div>
    </div>
  );
}

export default SocialSignIn;
