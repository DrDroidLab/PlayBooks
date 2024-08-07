import { ListItemButton, ListItemIcon } from "@mui/material";
import { ReactNode } from "react";

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
  return (
    <ListItemButton
      onClick={onClick}
      className="!flex !justify-start !p-3 !gap-3">
      <div className="text-gray-500">{icon}</div>
      <p className="text-sm flex-1">{label}</p>
    </ListItemButton>
  );
}

export default SidebarButtonElement;
