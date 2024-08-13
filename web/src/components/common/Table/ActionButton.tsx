import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface Action {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

interface ActionButtonProps {
  actions: Action[];
}

const ActionButton: React.FC<ActionButtonProps> = ({ actions }) => {
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
        className="flex items-center justify-center p-1 cursor-pointer text-gray-700 hover:text-gray-900">
        <MoreVertIcon />
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
            className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none">
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </button>
            ))}
          </motion.div>,
          document.body,
        )}
    </div>
  );
};

export default ActionButton;
