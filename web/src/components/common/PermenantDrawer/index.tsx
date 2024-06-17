import React, { useRef } from "react";
import HandlePermanentDrawerData from "./HandlePermanentDrawerData.tsx";
import { motion } from "framer-motion";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";

function PermenantDrawer({ addtionalStyles = "" }) {
  const { isOpen } = usePermanentDrawerState();
  const drawerRef = useRef(null);

  const drawerVariants = {
    open: { flex: 0.6 },
    closed: { flex: 0 },
  };

  return (
    <motion.div
      ref={drawerRef}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={drawerVariants}
      transition={{ type: "tween", stiffness: 260, damping: 20 }}
      className={`${addtionalStyles} flex-[0.6] overflow-hidden`}>
      <div className="border-l-gray-200 h-full overflow-y-scroll border-l-[1px]">
        <HandlePermanentDrawerData />
      </div>
    </motion.div>
  );
}

export default PermenantDrawer;
