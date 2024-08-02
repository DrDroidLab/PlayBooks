/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import styles from "./index.module.css";

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
          <div ref={overlayRef} className={styles.children}>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Overlay;
