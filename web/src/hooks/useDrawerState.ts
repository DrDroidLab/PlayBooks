import { useDispatch, useSelector } from "react-redux";
import {
  closeDrawer,
  drawersSelector,
  openDrawer,
  toggleDrawer,
} from "../store/features/drawers/drawersSlice.ts";

type DrawerState = {
  isOpen: boolean;
  toggle: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

function useDrawerState(id: string): DrawerState {
  const drawers = useSelector(drawersSelector);
  const dispatch = useDispatch();

  const isOpen = drawers[id];

  const openDrawerFunction = () => {
    dispatch(openDrawer(id));
  };

  const closeDrawerFunction = () => {
    dispatch(closeDrawer(id));
  };

  const toggle = () => {
    dispatch(toggleDrawer(id));
  };

  return {
    isOpen,
    toggle,
    openDrawer: openDrawerFunction,
    closeDrawer: closeDrawerFunction,
  };
}

export default useDrawerState;
