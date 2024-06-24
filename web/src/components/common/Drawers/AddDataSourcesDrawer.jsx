import React from "react";
import CustomDrawer from "../CustomDrawer/index.jsx";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";

const id = DrawerTypes.ADD_DATA_SOURCES;

function AddDataSourcesDrawer() {
  return <CustomDrawer id={id} src={"/data-sources/add"} />;
}

export default AddDataSourcesDrawer;
