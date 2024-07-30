import React from "react";
import CustomDrawer from "../CustomDrawer/index.tsx";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import { drawersSelector } from "../../../store/features/drawers/drawersSlice.ts";
import { useSelector } from "react-redux";

const id = DrawerTypes.ADD_DATA_SOURCES;

function AddDataSourcesDrawer() {
  const drawers = useSelector(drawersSelector);
  const isOpen = drawers[id];

  if (!isOpen) return;

  return <CustomDrawer id={id} src={"/data-sources/add"} />;
}

export default AddDataSourcesDrawer;