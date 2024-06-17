import React from "react";
import CustomDrawer from "../CustomDrawer/index.jsx";
import { useDispatch } from "react-redux";
import { setCurrentStepIndex } from "../../../store/features/playbook/playbookSlice.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import AddCondition from "../../AddCondition/index.tsx";
import useDrawerState from "../../../hooks/useDrawerState.ts";

const id = DrawerTypes.CONDITION;

function ConditionDrawer() {
  const dispatch = useDispatch();
  const { isOpen } = useDrawerState(id);

  if (!isOpen) return;

  return (
    <CustomDrawer
      id={id}
      onClose={() => dispatch(setCurrentStepIndex(null))}
      startFrom="80">
      <div className="flex-[0.4] border-l-[1px] border-l-gray-200 h-full overflow-scroll">
        <AddCondition />
      </div>
    </CustomDrawer>
  );
}

export default ConditionDrawer;
