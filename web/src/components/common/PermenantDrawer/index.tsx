import React, { useRef } from "react";
import HandlePermanentDrawerData from "./HandlePermanentDrawerData.tsx";
import { motion } from "framer-motion";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import { ChevronRightRounded } from "@mui/icons-material";
import CustomButton from "../CustomButton/index.tsx";

function PermenantDrawer({ addtionalStyles = "" }) {
  const { isOpen, closeDrawer } = usePermanentDrawerState();
  const drawerRef = useRef(null);

  const drawerVariants = {
    open: { flex: 0.6, overflow: "visible" },
    closed: { flex: 0, overflow: "hidden" },
  };

  return (
    <motion.div
      ref={drawerRef}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={drawerVariants}
      transition={{ type: "tween", stiffness: 260, damping: 20 }}
      className={`${addtionalStyles} relative flex-[0.6] max-w-[40%]`}>
      <div className="absolute top-0 -left-10 p-1">
        <CustomButton onClick={closeDrawer}>
          <ChevronRightRounded fontSize="small" />
        </CustomButton>
      </div>
      <div className="border-l-gray-200 h-full overflow-y-scroll border-l-[1px]">
        <HandlePermanentDrawerData />
      </div>
    </motion.div>
  );
}

export default PermenantDrawer;
