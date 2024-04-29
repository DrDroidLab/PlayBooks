import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CloseRounded } from "@mui/icons-material";

const CustomDrawer = ({
  isOpen,
  setIsOpen,
  children,
  src,
  openFrom = "right",
  addtionalStyles,
  showOverlay = true,
  startFrom = "0",
}) => {
  const drawerVariants = {
    open: { x: 0 },
    closed: { x: `${(openFrom === "right" ? 1 : -1) * 100}%` },
  };

  // Handle keyboard interactions
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  return (
    <>
      {showOverlay && (
        <div
          style={{ display: isOpen ? "block" : "none", top: `${startFrom}px` }}
          className={`fixed left-0 bg-black opacity-25 w-screen h-screen z-[91] transition-all`}
        />
      )}
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={drawerVariants}
        style={{ top: `${startFrom}px` }}
        transition={{ type: "tween", stiffness: 260, damping: 20 }}
        className={`${addtionalStyles} fixed ${
          openFrom === "right" ? "right-0" : "left-0"
        } h-full bg-white shadow-lg z-[100] w-full lg:w-1/2`}>
        <div className={`flex ${openFrom === "left" ? "justify-end" : ""}`}>
          <button onClick={() => setIsOpen(false)} className="text-2xl p-2">
            <CloseRounded />
          </button>
        </div>
        <hr />
        {children && (
          <div className="pb-15 overflow-auto h-full">{children}</div>
        )}
        {src && (
          <iframe
            src={src}
            id="drawer-iframe"
            frameBorder="0"
            width="100%"
            height="100%"
            allow="fullscreen"
            title="Embedded Page"
            className="pb-20"
          />
        )}
      </motion.div>
    </>
  );
};

export default CustomDrawer;
