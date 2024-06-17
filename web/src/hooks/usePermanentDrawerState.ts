import { useDispatch, useSelector } from "react-redux";
import {
  setPermanentView,
  PermanentDrawerTypesKeys,
  permanentViewSelector,
} from "../store/features/drawers/drawersSlice.ts";
import { PermanentDrawerTypes } from "../store/features/drawers/permanentDrawerTypes.ts";

type DrawerState = {
  isOpen: boolean;
  openDrawer: (view: PermanentDrawerTypesKeys) => void;
  permanentView: PermanentDrawerTypesKeys;
};

function usePermanentDrawerState(): DrawerState {
  const permanentView = useSelector(permanentViewSelector);
  const dispatch = useDispatch();
  const isOpen = permanentView !== PermanentDrawerTypes.DEFAULT;

  const openDrawerFunction = (view: PermanentDrawerTypesKeys) => {
    dispatch(setPermanentView(view));
  };

  return {
    isOpen,
    openDrawer: openDrawerFunction,
    permanentView,
  };
}

export default usePermanentDrawerState;
