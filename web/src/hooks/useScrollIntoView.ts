import { useEffect, useRef } from "react";
import usePlaybookKey from "./usePlaybookKey.ts";

const useScrollIntoView = (index) => {
  const ref = useRef<any>(null);
  const [shouldScroll, setShouldScroll] = usePlaybookKey("shouldScroll");
  const [currentVisibleStep] = usePlaybookKey("currentVisibleStep");

  useEffect(() => {
    if (shouldScroll && index === currentVisibleStep + 1) {
      setShouldScroll(false);
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentVisibleStep, index, setShouldScroll, shouldScroll]);

  return ref;
};

export default useScrollIntoView;
