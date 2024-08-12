import { useDispatch, useSelector } from "react-redux";
import { sidebarSelector } from "../../../store/features/sidebar/selectors";
import { toggleSidebar } from "../../../store/features/sidebar/sidebarSlice";

type UseSidebarReturnType = {
  isOpen: boolean;
  toggle: () => void;
};

function useSidebar(): UseSidebarReturnType {
  const { isOpen } = useSelector(sidebarSelector);
  const dispatch = useDispatch();

  const toggle = () => {
    dispatch(toggleSidebar());
  };

  return {
    isOpen,
    toggle,
  };
}

export default useSidebar;
