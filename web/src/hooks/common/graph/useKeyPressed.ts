import { useState, useEffect } from "react";

const useKeyPressed = () => {
  const [keyPressed, setKeyPressed] = useState(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Shift") {
      setKeyPressed(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Shift") {
      setKeyPressed(false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keyPressed;
};

export default useKeyPressed;
