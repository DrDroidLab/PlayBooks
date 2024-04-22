import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CloseRounded } from "@mui/icons-material";

const drawerVariants = {
  open: { x: 0 },
  closed: { x: "100%" },
};

const CustomDrawer = ({ isOpen, setIsOpen, children, src }) => {
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
      <div
        style={isOpen ? { display: "block" } : { display: "none" }}
        className="fixed top-0 left-0 bg-black opacity-25 w-screen h-screen z-[91] transition-all"></div>
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={drawerVariants}
        transition={{ type: "tween", stiffness: 260, damping: 20 }}
        className="fixed top-0 right-0 h-full bg-white shadow-lg z-[100] w-full lg:w-1/2">
        <button onClick={() => setIsOpen(false)} className="text-2xl p-2">
          <CloseRounded />
        </button>
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
