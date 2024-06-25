import React from "react";
import CustomDrawer from "../CustomDrawer/index.jsx";
import { useDispatch } from "react-redux";
import { setCurrentStepId } from "../../../store/features/playbook/playbookSlice.ts";
import StepDetails from "../../Playbooks/create/StepDetails.jsx";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";

const id = DrawerTypes.STEP_DETAILS;

function StepDetailsDrawer() {
  const dispatch = useDispatch();

  return (
    <CustomDrawer
      id={id}
      onClose={() => dispatch(setCurrentStepId(null))}
      addtionalStyles={"lg:w-[50%]"}
      showOverlay={true}
      startFrom="80">
      <div className="flex-[0.4] border-l-[1px] border-l-gray-200 h-full overflow-scroll">
        <StepDetails />
      </div>
    </CustomDrawer>
  );
}

export default StepDetailsDrawer;
