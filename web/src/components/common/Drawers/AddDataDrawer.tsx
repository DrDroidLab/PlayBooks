import React from "react";
import CustomDrawer from "../CustomDrawer/index.jsx";
import Sidebar from "../../Playbooks/create/Sidebar.jsx";

function AddDataDrawer({
  parentIndex,
  setParentIndex,
  addDataDrawerOpen,
  setAddDataDrawerOpen,
}) {
  return (
    <CustomDrawer
      isOpen={addDataDrawerOpen}
      setIsOpen={setAddDataDrawerOpen}
      openFrom="left"
      addtionalStyles={"lg:w-[20%]"}
      showOverlay={false}
      startFrom="80">
      <div className="flex-[0.4] border-r-[1px] border-r-gray-200 h-full">
        <Sidebar
          parentIndex={parentIndex}
          setParentIndex={setParentIndex}
          setIsOpen={setAddDataDrawerOpen}
        />
      </div>
    </CustomDrawer>
  );
}

export default AddDataDrawer;
