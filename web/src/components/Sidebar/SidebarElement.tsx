import { ListItemIcon } from "@mui/material";
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type SidebarElementProps = {
  to: string;
  label: string;
  icon: ReactNode;
};

function SidebarElement({ to, label, icon }: SidebarElementProps) {
  const activeStyle = ({ isActive }) => (isActive ? "activeNavLink" : "");

  return (
    <NavLink className={activeStyle} to={to}>
      <div className={`flex gap-3 items-center`}>
        <div className="text-gray-500">{icon}</div>
        <p className="text-sm">{label}</p>
      </div>
    </NavLink>
  );
}

export default SidebarElement;
