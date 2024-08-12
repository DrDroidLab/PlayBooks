import { SidebarInitialState } from "../initialState";

export const toggle = (state: SidebarInitialState) => {
  state.isOpen = !state.isOpen;
};
