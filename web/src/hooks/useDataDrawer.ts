import { useState } from "react";

function useDataDrawer() {
  const [addDataDrawerOpen, setAddDataDrawerOpen] = useState(false);
  const [parentIndex, setParentIndex] = useState(null);

  return {
    addDataDrawerOpen,
    parentIndex,
    setAddDataDrawerOpen,
    setParentIndex,
  };
}

export default useDataDrawer;
