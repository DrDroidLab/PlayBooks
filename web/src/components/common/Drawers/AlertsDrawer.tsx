import React from "react";
import CustomDrawer from "../CustomDrawer/index.tsx";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import AlertsTable from "../../Workflows/triggers/AlertsTable.js";
import useDrawerState from "../../../hooks/common/useDrawerState.ts";

const id = DrawerTypes.ALERTS;

function AlertsDrawer() {
  const { isOpen } = useDrawerState(DrawerTypes.ALERTS);

  if (!isOpen) return;

  return (
    <CustomDrawer id={id}>
      <div className="bg-gray-100 p-2 h-full">
        <AlertsTable />
      </div>
    </CustomDrawer>
  );
}

export default AlertsDrawer;
