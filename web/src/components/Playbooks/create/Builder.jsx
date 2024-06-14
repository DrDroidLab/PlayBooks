import CreateFlow from "./CreateFlow";
import GlobalVariables from "../../common/GlobalVariable";
import AddDataDrawer from "../../common/Drawers/AddDataDrawer.jsx";
import TemplatesDrawer from "../../common/Drawers/TemplatesDrawer.jsx";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import StepDetailsDrawer from "../../common/Drawers/StepDetailsDrawer.jsx";
import CustomButton from "../../common/CustomButton/index.tsx";

function Builder({ isLog = false }) {
  const { toggle: toggleAddData } = useDrawerState(DrawerTypes.ADD_DATA);
  const { toggle: toggleTemplates } = useDrawerState(DrawerTypes.TEMPLATES);

  return (
    <div className="h-full w-full">
      <div className="absolute top-2 left-2 flex flex-col items-start gap-4 z-10">
        {!isLog && (
          <>
            <CustomButton onClick={toggleAddData}>Add Data</CustomButton>
            <CustomButton onClick={toggleTemplates}>
              Import from templates
            </CustomButton>
          </>
        )}
        <div className="bg-white p-1 rounded w-[300px]">
          <GlobalVariables />
        </div>
      </div>
      <AddDataDrawer />
      <TemplatesDrawer />
      <div className="flex-[1] h-full">
        <CreateFlow />
      </div>
      <StepDetailsDrawer />
    </div>
  );
}

export default Builder;
