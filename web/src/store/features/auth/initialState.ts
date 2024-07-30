export type InitialStateType = {
  accessToken: string | null;
  refreshToken?: string | null;
  email?: string | null;
  user?: any;
  lastLogin?: string | null;
  providers: string[];
};

export const initialState: InitialStateType = {
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("access_token"),
  email: localStorage.getItem("email"),
  user: undefined,
  lastLogin: localStorage.getItem("lastLogin"),
  providers: [],
};
