import CreateFlow from "./CreateFlow.js";
import GlobalVariables from "../../common/GlobalVariable/index.js";
import AddDataDrawer from "../../common/Drawers/AddDataDrawer.js";
import TemplatesDrawer from "../../common/Drawers/TemplatesDrawer.js";
import useDrawerState from "../../../hooks/common/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import CustomButton from "../../common/CustomButton/index.tsx";
import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";

function Builder({ isLog = false }) {
  const { toggle: toggleAddData, addAdditionalData } = useDrawerState(
    DrawerTypes.ADD_DATA,
  );
  const currentPlaybook = useSelector(currentPlaybookSelector);

  const handleOpenDrawer = () => {
    toggleAddData();
    addAdditionalData({ stepId: currentPlaybook?.steps?.[0]?.id });
  };

  return (
    <div className="h-full w-full">
      <div className="absolute top-2 left-2 flex flex-col items-start gap-4 z-10">
        {!isLog && (
          <>
            <CustomButton onClick={handleOpenDrawer}>Add Data</CustomButton>
          </>
        )}
        <GlobalVariables />
      </div>
      <AddDataDrawer />
      <TemplatesDrawer />
      <div className="flex-[1] h-full">
        <CreateFlow />
      </div>
    </div>
  );
}

export default Builder;
