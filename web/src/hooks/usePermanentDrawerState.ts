import { useDispatch, useSelector } from "react-redux";
import {
  setPermanentView,
  PermanentDrawerTypesKeys,
  permanentViewSelector,
  setAdditionalState,
  additionalStateSelector,
} from "../store/features/drawers/drawersSlice.ts";
import { PermanentDrawerTypes } from "../store/features/drawers/permanentDrawerTypes.ts";
import { setCurrentStepIndex } from "../store/features/playbook/playbookSlice.ts";

type DrawerState = {
  isOpen: boolean;
  openDrawer: (view: PermanentDrawerTypesKeys) => void;
  closeDrawer: () => void;
  addAdditionalData: (data: any) => void;
  additionalData: any;
  permanentView: PermanentDrawerTypesKeys;
};

function usePermanentDrawerState(): DrawerState {
  const permanentView = useSelector(permanentViewSelector);
  const additionalData = useSelector(additionalStateSelector);
  const dispatch = useDispatch();
  const isOpen = permanentView !== PermanentDrawerTypes.DEFAULT;

  const openDrawerFunction = (view: PermanentDrawerTypesKeys) => {
    dispatch(setPermanentView(view));
  };

  const closeDrawerFunction = () => {
    dispatch(setPermanentView(PermanentDrawerTypes.DEFAULT));
    dispatch(setCurrentStepIndex(null));
    dispatch(setAdditionalState({}));
  };

  const addAdditionalData = (data: any) => {
    dispatch(setCurrentStepIndex(null));
    dispatch(setAdditionalState(data));
  };

  return {
    isOpen,
    openDrawer: openDrawerFunction,
    closeDrawer: closeDrawerFunction,
    addAdditionalData,
    additionalData,
    permanentView,
  };
}

export default usePermanentDrawerState;
