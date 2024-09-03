import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Row } from ".";

interface Action {
  icon: React.ReactNode;
  label: string;
  action: (item: any) => void;
  condition?: (item: any) => boolean;
}

interface ActionButtonProps {
  actions: Action[];
  row: Row;
}

const ActionButton: React.FC<ActionButtonProps> = ({ actions, row }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsOpen(true);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const bottomSpace = window.innerHeight - rect.bottom;
      const rightSpace = window.innerWidth - rect.right;

      setPopupStyle({
        top: bottomSpace < 100 ? rect.top - 100 : rect.bottom,
        left: rightSpace < 160 ? rect.right - 160 : rect.left,
        position: "fixed",
      });
    }
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={buttonRef}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${
          isOpen ? "text-violet-500" : ""
        } flex items-center justify-center p-1 cursor-pointer text-gray-700 hover:text-violet-500`}>
        <MoreVertIcon color="inherit" />
      </div>
      {isOpen &&
        ReactDOM.createPortal(
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={popupStyle}
            className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
            {actions
              .filter((action) =>
                action.condition ? action.condition(row) !== false : true,
              )
              .map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.action(row)}
                  className="w-full flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-500 focus:outline-none rounded">
                  {action.icon}
                  <span className="ml-2 text-left">{action.label}</span>
                </button>
              ))}
          </motion.div>,
          document.body,
        )}
    </div>
  );
};

export default ActionButton;
