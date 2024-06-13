import CreateFlow from "./CreateFlow";
import GlobalVariables from "../../common/GlobalVariable";
import AddDataDrawer from "../../common/Drawers/AddDataDrawer.jsx";
import TemplatesDrawer from "../../common/Drawers/TemplatesDrawer.jsx";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import StepDetailsDrawer from "../../common/Drawers/StepDetailsDrawer.jsx";

function Builder({ isLog = false }) {
  const { toggle: toggleAddData } = useDrawerState(DrawerTypes.ADD_DATA);
  const { toggle: toggleTemplates } = useDrawerState(DrawerTypes.TEMPLATES);

  return (
    <div className="h-full w-full">
      <div className="absolute top-2 left-2 flex flex-col items-start gap-4">
        {!isLog && (
          <>
            <button
              onClick={toggleAddData}
              className="border w-fit border-violet-500 text-violet-500 p-1 rounded transition-all hover:text-white hover:bg-violet-500 text-sm z-10">
              Add Data
            </button>
            <button
              onClick={toggleTemplates}
              className="border w-fit border-violet-500 text-violet-500 p-1 rounded transition-all hover:text-white hover:bg-violet-500 text-sm z-10">
              Import from templates
            </button>
          </>
        )}
        <div className="z-10 bg-white p-1 rounded w-[300px]">
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
