import { useDispatch, useSelector } from "react-redux";
import {
  setPermanentView,
  permanentViewSelector,
  setAdditionalState,
  additionalStateSelector,
} from "../../store/features/drawers/drawersSlice.ts";
import { PermanentDrawerTypes } from "../../store/features/drawers/permanentDrawerTypes.ts";
import { setCurrentVisibleTask } from "../../store/features/playbook/playbookSlice.ts";
import { PermanentDrawerTypesKeys } from "../../store/features/drawers/initialState.ts";

type DrawerState = {
  isOpen: boolean;
  openDrawer: (view: PermanentDrawerTypesKeys) => void;
  toggle: (view: PermanentDrawerTypesKeys) => void;
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

  const toggleDrawerFunction = (view: PermanentDrawerTypesKeys) => {
    if (permanentView === view) {
      dispatch(setPermanentView(PermanentDrawerTypes.DEFAULT));
      dispatch(setCurrentVisibleTask(null));
      dispatch(setAdditionalState({}));
      return;
    }
    dispatch(setPermanentView(view));
  };

  const closeDrawerFunction = () => {
    dispatch(setPermanentView(PermanentDrawerTypes.DEFAULT));
    dispatch(setCurrentVisibleTask(null));
    dispatch(setAdditionalState({}));
  };

  const addAdditionalData = (data: any) => {
    dispatch(setCurrentVisibleTask(null));
    dispatch(setAdditionalState(data));
  };

  return {
    isOpen,
    openDrawer: openDrawerFunction,
    closeDrawer: closeDrawerFunction,
    toggle: toggleDrawerFunction,
    addAdditionalData,
    additionalData,
    permanentView,
  };
}

export default usePermanentDrawerState;
