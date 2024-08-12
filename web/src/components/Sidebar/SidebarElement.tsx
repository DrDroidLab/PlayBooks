import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import useSidebar from "../../hooks/common/sidebar/useSidebar";

type SidebarElementProps = {
  to: string;
  label: string;
  icon: ReactNode;
};

function SidebarElement({ to, label, icon }: SidebarElementProps) {
  const { isOpen } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink className="relative flex px-2 items-center" to={to}>
      <div
        className={`flex gap-2 py-1 pl-2 items-center w-full rounded ${
          isActive
            ? "bg-violet-50 text-violet-500"
            : "text-gray-500 hover:bg-gray-50"
        }`}>
        <div className="">{icon}</div>
        {isOpen && <p className="text-sm">{label}</p>}
      </div>
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute left-2 h-[70%] w-1 bg-violet-500 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </NavLink>
  );
}

export default SidebarElement;
