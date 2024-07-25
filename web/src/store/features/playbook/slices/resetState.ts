import { PlaybookUIState } from "../../../../types/index.ts";
import { initialState } from "../initialState.ts";
import { PermanentDrawerTypes } from "../../drawers/permanentDrawerTypes.ts";

export const resetState = (state: PlaybookUIState) => {
  state.currentPlaybook = initialState.currentPlaybook;
  state.currentVisibleTask = undefined;
  state.executionId = undefined;
  state.isOnPlaybookPage = false;
  state.meta = undefined;
  state.permanentView = PermanentDrawerTypes.DEFAULT;
  state.playbooks = [];
  state.shouldScroll = false;
  state.zoomLevel = 0.75;
};
