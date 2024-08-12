import CreateFlow from "./CreateFlow.js";
import GlobalVariables from "../../common/GlobalVariable/index.js";
import AddDataDrawer from "../../common/Drawers/AddDataDrawer.js";
import TemplatesDrawer from "../../common/Drawers/TemplatesDrawer.js";

function Builder() {
  return (
    <div className="h-full w-full">
      <div className="absolute top-2 left-2 flex flex-col items-start gap-4 z-10">
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
