/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CloseRounded } from "@mui/icons-material";
import useDrawerState from "../../../hooks/common/useDrawerState";
import { DrawerTypesKeys } from "../../../store/features/drawers/initialState";

type CustomDrawerPropTypes = {
  id: DrawerTypesKeys;
  children?: React.ReactNode;
  src?: string;
  openFrom?: "right" | "left";
  addtionalStyles?: string;
  showOverlay?: boolean;
  startFrom?: string;
  OnClose?: () => void;
};

const CustomDrawer = ({
  id,
  children,
  src = undefined,
  openFrom = "right",
  addtionalStyles,
  showOverlay = true,
  startFrom = "0",
  OnClose,
}: CustomDrawerPropTypes) => {
  const { isOpen, closeDrawer } = useDrawerState(id);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerVariants = {
    open: { x: 0 },
    closed: { x: `${(openFrom === "right" ? 1 : -1) * 100}%` },
  };

  const close = () => {
    if (OnClose) {
      OnClose();
    }
    if (isOpen) closeDrawer();
  };

  // Handle keyboard interactions
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef?.current && !drawerRef?.current?.contains(event.target)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [drawerRef]);

  return (
    <>
      {showOverlay && (
        <div
          style={{ display: isOpen ? "block" : "none", top: `${startFrom}px` }}
          className={`fixed left-0 bg-black opacity-25 w-screen h-screen z-[91] transition-all`}
        />
      )}
      <motion.div
        id={id}
        ref={drawerRef}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={drawerVariants}
        style={{ top: `${startFrom}px` }}
        transition={{ type: "tween", stiffness: 260, damping: 20 }}
        className={`${addtionalStyles} fixed ${
          openFrom === "right" ? "right-0" : "left-0"
        } h-full bg-white shadow-lg z-[100] w-full lg:w-1/2`}>
        <div className={`flex ${openFrom === "left" ? "justify-end" : ""}`}>
          <button onClick={close} className="text-2xl p-2">
            <CloseRounded />
          </button>
        </div>
        <hr />
        {children && (
          <div className="pb-15 overflow-auto h-full">{children}</div>
        )}
        {src && isOpen && (
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
