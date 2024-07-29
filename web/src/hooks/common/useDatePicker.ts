import { useEffect, useRef } from "react";
import { useDropdownContext } from "../../contexts/DropdownContext.tsx";
import { findClosestPopup } from "../../utils/common/findClosestPopup.ts";

const useDatePicker = () => {
  const pickerRef = useRef(null);
  const { registerRef } = useDropdownContext();

  useEffect(() => {
    if (pickerRef.current) {
      registerRef(pickerRef);
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            const popup = findClosestPopup(node);
            if (popup) {
              registerRef({ current: popup });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [pickerRef, registerRef]);

  return pickerRef;
};

export default useDatePicker;
