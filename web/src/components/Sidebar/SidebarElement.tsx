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
      <ListItemIcon>{icon}</ListItemIcon>
      <p className="text-sm">{label}</p>
    </NavLink>
  );
}

export default SidebarElement;
