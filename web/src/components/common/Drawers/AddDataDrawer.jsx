import React from "react";
import CustomDrawer from "../CustomDrawer";
import Sidebar from "../../Playbooks/create/Sidebar";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";

function AddDataDrawer() {
  return (
    <CustomDrawer
      id={DrawerTypes.ADD_DATA}
      openFrom="left"
      addtionalStyles={"lg:w-[20%]"}
      showOverlay={false}
      startFrom="80">
      <div className="flex-[0.4] border-r-[1px] border-r-gray-200 h-full">
        <Sidebar />
      </div>
    </CustomDrawer>
  );
}

export default AddDataDrawer;
