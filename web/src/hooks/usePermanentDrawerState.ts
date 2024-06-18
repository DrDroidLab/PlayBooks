import { useDispatch, useSelector } from "react-redux";
import {
  setPermanentView,
  PermanentDrawerTypesKeys,
  permanentViewSelector,
  setAdditionalState,
} from "../store/features/drawers/drawersSlice.ts";
import { PermanentDrawerTypes } from "../store/features/drawers/permanentDrawerTypes.ts";
import { setCurrentStepIndex } from "../store/features/playbook/playbookSlice.ts";

type DrawerState = {
  isOpen: boolean;
  openDrawer: (view: PermanentDrawerTypesKeys) => void;
  closeDrawer: () => void;
  addAdditionalData: (data: any) => void;
  permanentView: PermanentDrawerTypesKeys;
};

function usePermanentDrawerState(): DrawerState {
  const permanentView = useSelector(permanentViewSelector);
  const dispatch = useDispatch();
  const isOpen = permanentView !== PermanentDrawerTypes.DEFAULT;

  const openDrawerFunction = (view: PermanentDrawerTypesKeys) => {
    dispatch(setPermanentView(view));
  };

  const closeDrawerFunction = () => {
    dispatch(setPermanentView(PermanentDrawerTypes.DEFAULT));
    dispatch(setCurrentStepIndex(null));
  };

  const addAdditionalData = (data: any) => {
    dispatch(setAdditionalState(data));
  };

  return {
    isOpen,
    openDrawer: openDrawerFunction,
    closeDrawer: closeDrawerFunction,
    addAdditionalData,
    permanentView,
  };
}

export default usePermanentDrawerState;
