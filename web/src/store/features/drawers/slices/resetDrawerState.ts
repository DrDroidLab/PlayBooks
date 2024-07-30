import { InitialStateType } from "../initialState";
import { PermanentDrawerTypes } from "../permanentDrawerTypes";

export const resetDrawerState = (state: InitialStateType) => {
  state.permanentView = PermanentDrawerTypes.DEFAULT;
};
