import { useEffect } from "react";

function useDefaultPage() {
  useEffect(() => {
    const loader = document.querySelector(
      ".loader-container",
    ) as HTMLDivElement;
    if (loader) {
      loader.style.display = "none";
    }
  }, []);
}

export default useDefaultPage;
