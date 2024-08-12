import { ChevronLeftRounded } from "@mui/icons-material";
import useSidebar from "../../hooks/common/sidebar/useSidebar";

function ToggleButton() {
  const { isOpen, toggle: toggleSidebar } = useSidebar();

  return (
    <button
      className={`text-gray-500 focus:outline-none p-2 flex ${
        isOpen ? "justify-end" : "justify-center"
      }`}
      onClick={toggleSidebar}>
      <ChevronLeftRounded
        className={`${isOpen ? "rotate-0" : "rotate-180"} transition-all`}
      />
    </button>
  );
}

export default ToggleButton;
