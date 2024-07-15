import React from "react";
import CustomDrawer from "../CustomDrawer";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import AlertsTable from "../../Workflows/triggers/AlertsTable";
import useDrawerState from "../../../hooks/useDrawerState.ts";

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
