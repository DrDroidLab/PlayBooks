import React from "react";
import OctaSignIn from "./OctaSignIn.tsx";
import { AuthProviders } from "../utils/AuthProviders.ts";

export const oAuthProviders = {
  [AuthProviders.OKTA]: <OctaSignIn />,
};
