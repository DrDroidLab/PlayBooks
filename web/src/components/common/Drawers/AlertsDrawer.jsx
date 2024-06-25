import React from "react";
import CustomDrawer from "../CustomDrawer";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import { useLazyGetSearchTriggersQuery } from "../../../store/features/triggers/api/searchTriggerApi.ts";
import { CircularProgress } from "@mui/material";
import AlertsTable from "../../Workflows/triggers/AlertsTable";

const id = DrawerTypes.ALERTS;

function AlertsDrawer() {
  const [{ data: searchTriggerResult, isFetching: searchLoading }] =
    useLazyGetSearchTriggersQuery();
  const data = searchTriggerResult?.alerts ?? [];

  return (
    <CustomDrawer id={id}>
      {searchLoading ? (
        <CircularProgress size={20} style={{ marginLeft: "10px" }} />
      ) : data ? (
        <div className="bg-gray-100 p-2 h-full">
          <AlertsTable data={data} />
        </div>
      ) : (
        <></>
      )}
    </CustomDrawer>
  );
}

export default AlertsDrawer;
