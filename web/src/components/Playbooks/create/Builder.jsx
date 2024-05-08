import React, { useState } from "react";
import CustomDrawer from "../../common/CustomDrawer";
import Sidebar from "./Sidebar";
import CreateFlow from "./CreateFlow";
import StepDetails from "./StepDetails";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setCurrentStepIndex,
} from "../../../store/features/playbook/playbookSlice.ts";
import GlobalVariables from "../../common/GlobalVariable";
import TemplatesList from "./TemplatesList.jsx";

function Builder() {
  const [addDataDrawerOpen, setAddDataDrawerOpen] = useState(false);
  const [importFromTemplatesOpen, setImportFromTemplatesOpen] = useState(false);
  const { currentStepIndex } = useSelector(playbookSelector);
  const dispatch = useDispatch();

  return (
    <div className="h-full w-full">
      <div className="absolute top-2 left-2 flex flex-col items-start gap-4">
        <button
          onClick={() => setAddDataDrawerOpen(true)}
          className="border w-fit border-violet-500 text-violet-500 p-1 rounded transition-all hover:text-white hover:bg-violet-500 text-sm z-10">
          Add Data
        </button>
        <button
          onClick={() => setImportFromTemplatesOpen(true)}
          className="border w-fit border-violet-500 text-violet-500 p-1 rounded transition-all hover:text-white hover:bg-violet-500 text-sm z-10">
          Import from templates
        </button>
        <div className="z-10 bg-white p-1 rounded w-[300px]">
          <GlobalVariables />
        </div>
      </div>
      <CustomDrawer
        isOpen={addDataDrawerOpen}
        setIsOpen={setAddDataDrawerOpen}
        openFrom="left"
        addtionalStyles={"lg:w-[20%]"}
        showOverlay={false}
        startFrom="80">
        <div className="flex-[0.4] border-r-[1px] border-r-gray-200 h-full">
          <Sidebar setIsOpen={setAddDataDrawerOpen} />
        </div>
      </CustomDrawer>
      <CustomDrawer
        isOpen={importFromTemplatesOpen}
        setIsOpen={setImportFromTemplatesOpen}
        openFrom="left"
        addtionalStyles={"lg:w-[20%]"}
        showOverlay={false}
        startFrom="80">
        <div className="flex-[0.4] border-r-[1px] border-r-gray-200 h-full">
          <TemplatesList
            setImportFromTemplatesOpen={setImportFromTemplatesOpen}
          />
        </div>
      </CustomDrawer>
      <div className="flex-[1] h-full">
        <CreateFlow />
      </div>
      <CustomDrawer
        isOpen={currentStepIndex}
        setIsOpen={() => dispatch(setCurrentStepIndex(null))}
        addtionalStyles={"lg:w-[50%]"}
        showOverlay={true}
        startFrom="80">
        <div className="flex-[0.4] border-l-[1px] border-l-gray-200 h-full overflow-scroll">
          <StepDetails />
        </div>
      </CustomDrawer>
    </div>
  );
}

export default Builder;
