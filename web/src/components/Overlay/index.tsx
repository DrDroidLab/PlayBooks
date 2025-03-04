/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import styles from "./index.module.css";
import { motion } from "framer-motion";

const Overlay = (props) => {
  const { children, visible, close } = props;
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef?.current && !overlayRef?.current?.contains(event.target)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [overlayRef]);

  return (
    <>
      {visible && (
        <div className={styles.overlay}>
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={styles.children}>
            {children}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Overlay;
