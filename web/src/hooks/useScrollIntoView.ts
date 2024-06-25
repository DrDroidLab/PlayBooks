import { useEffect, useRef } from "react";
import usePlaybookKey from "./usePlaybookKey.ts";

const useScrollIntoView = (index: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = usePlaybookKey("shouldScroll");
  const [currentVisibleStep] = usePlaybookKey("currentVisibleStep");

  const handleShouldScrollIndex = () => {
    switch (shouldScroll) {
      case "next":
        return currentVisibleStep + 1;

      case "previous":
        return currentVisibleStep - 1;

      default:
        return currentVisibleStep;
    }
  };

  const showStep = () => {
    const scrollIndex = handleShouldScrollIndex();
    if (shouldScroll && index === scrollIndex) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setShouldScroll(undefined);
    }
  };

  useEffect(() => {
    showStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVisibleStep, index, setShouldScroll, shouldScroll]);

  return ref;
};

export default useScrollIntoView;
