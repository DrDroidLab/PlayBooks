import { ListItemButton, ListItemIcon } from "@mui/material";
import { ReactNode } from "react";
import useSidebar from "../../hooks/common/sidebar/useSidebar";

type SidebarButtonElementProps = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
};

function SidebarButtonElement({
  onClick,
  label,
  icon,
}: SidebarButtonElementProps) {
  const { isOpen } = useSidebar();

  return (
    <div
      onClick={onClick}
      className="flex gap-2 mx-2 px-2 py-1 items-center max-w-full rounded text-gray-500 hover:bg-gray-50 cursor-pointer">
      <div className="text-gray-500">{icon}</div>
      {isOpen && <p className="text-sm flex-1">{label}</p>}
    </div>
  );
}

export default SidebarButtonElement;
