import React from "react";
import CustomButton from "../../../common/CustomButton/index.tsx";
import { RefreshRounded } from "@mui/icons-material";
import useDrawerState from "../../../../hooks/common/useDrawerState.ts";
import { DrawerTypes } from "../../../../store/features/drawers/drawerTypes.ts";
import AddDataSourcesDrawer from "../../../common/Drawers/AddDataSourcesDrawer.js";

const id = DrawerTypes.ADD_DATA_SOURCES;

function AddNewIntegration({ refetch, data }) {
  const { toggle } = useDrawerState(id);
  const handleClick = () => {
    toggle();
  };

  return (
    <div className="flex items-center gap-1">
      <div onClick={refetch}>
        <RefreshRounded className="text-gray-500 hover:text-black cursor-pointer" />
      </div>
      {data?.length === 0 && (
        <CustomButton onClick={handleClick}>+ Add Integration</CustomButton>
      )}

      <AddDataSourcesDrawer />
    </div>
  );
}

export default AddNewIntegration;
