import { useDispatch, useSelector } from "react-redux";
import {
  closeDrawer,
  drawersSelector,
  openDrawer,
  toggleDrawer,
  setAdditionalState,
} from "../../store/features/drawers/drawersSlice.ts";
import {
  DrawerTypesKeys,
  PermanentDrawerTypesKeys,
} from "../../store/features/drawers/initialState.ts";

type DrawerState = {
  isOpen: boolean;
  toggle: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addAdditionalData: (data: any) => void;
};

function useDrawerState(id: DrawerTypesKeys): DrawerState {
  const drawers = useSelector(drawersSelector);
  const dispatch = useDispatch();

  const isOpen = drawers[id] ?? false;

  const openDrawerFunction = () => {
    dispatch(openDrawer(id));
  };

  const closeDrawerFunction = (resetState = true) => {
    dispatch(closeDrawer({ id, resetState }));
  };

  const toggle = () => {
    dispatch(toggleDrawer(id as PermanentDrawerTypesKeys));
  };

  const addAdditionalData = (data: any) => {
    dispatch(setAdditionalState(data));
  };

  return {
    isOpen,
    toggle,
    openDrawer: openDrawerFunction,
    closeDrawer: closeDrawerFunction,
    addAdditionalData,
  };
}

export default useDrawerState;
