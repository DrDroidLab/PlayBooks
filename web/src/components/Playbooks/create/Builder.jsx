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
import CustomButton from "../../common/CustomButton/index.tsx";
import Timeline from "../Timeline.jsx";

function Builder({ isLog = false }) {
  const [addDataDrawerOpen, setAddDataDrawerOpen] = useState(false);
  const [importFromTemplatesOpen, setImportFromTemplatesOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const { currentStepIndex, executionId } = useSelector(playbookSelector);
  const dispatch = useDispatch();

  return (
    <div className="h-full w-full">
      <div className="absolute top-2 left-2 flex flex-col items-start gap-4 z-10">
        {!isLog && (
          <>
            <CustomButton onClick={() => setAddDataDrawerOpen(true)}>
              Add Data
            </CustomButton>
            <CustomButton onClick={() => setImportFromTemplatesOpen(true)}>
              Import from templates
            </CustomButton>
          </>
        )}
        <div className="bg-white p-1 rounded w-[300px]">
          <GlobalVariables />
        </div>
      </div>
      <div className="absolute top-2 right-2 flex flex-col items-start gap-4 z-10">
        {executionId && (
          <CustomButton onClick={() => setTimelineOpen(true)}>
            View Timeline
          </CustomButton>
        )}
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
      <CustomDrawer
        isOpen={timelineOpen}
        setIsOpen={setTimelineOpen}
        addtionalStyles={"lg:w-[50%]"}
        showOverlay={true}
        startFrom="80">
        {timelineOpen && (
          <div className="flex-[0.4] border-l-[1px] border-l-gray-200 h-full overflow-scroll">
            <Timeline />
          </div>
        )}
      </CustomDrawer>
    </div>
  );
}

export default Builder;
