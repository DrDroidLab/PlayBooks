import React from "react";
import CustomDrawer from "../CustomDrawer/index.tsx";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import TemplatesList from "../../Playbooks/create/TemplatesList.tsx";

const id = DrawerTypes.TEMPLATES;

function TemplatesDrawer() {
  return (
    <CustomDrawer
      id={id}
      openFrom="left"
      addtionalStyles={"lg:w-[20%]"}
      showOverlay={false}
      startFrom="80">
      <div className="flex-[0.4] border-r-[1px] border-r-gray-200 h-full">
        <TemplatesList />
      </div>
    </CustomDrawer>
  );
}

export default TemplatesDrawer;
