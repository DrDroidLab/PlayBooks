/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteStep } from "../../../store/features/playbook/playbookSlice.ts";
import Query from "./Query.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import ExternalLinksList from "../../common/ExternalLinksList/index.tsx";
import SelectInterpretation from "./Interpretation.jsx";
import { Delete } from "@mui/icons-material";
import HandleNotesRender from "./HandleNotesRender.jsx";
import HandleExternalLinksRender from "./HandleExternalLinksRender.jsx";
import CustomButton from "../../common/CustomButton/index.tsx";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import RunButton from "../../Buttons/RunButton/index.tsx";

const id = DrawerTypes.ADD_DATA;
const currentStepDrawerId = DrawerTypes.STEP_DETAILS;

function Step({ step, index }) {
  const { openDrawer, addAdditionalData } = useDrawerState(id);
  const { closeDrawer: closeCurrentStep } = useDrawerState(currentStepDrawerId);
  const isPrefetched = useIsPrefetched();
  const [addQuery, setAddQuery] = useState(
    step?.isPrefetched ?? step.source ?? false,
  );
  const dispatch = useDispatch();

  function handleDeleteClick() {
    dispatch(deleteStep(step.stepIndex));
  }

  const handleAdd = (requireCondition = false) => {
    addAdditionalData({
      parentIndex: step.stepIndex,
      requireCondition,
      currentConditionParentIndex: step.stepIndex,
    });
    openDrawer();
    closeCurrentStep(false);
  };

  return (
    <div className="rounded my-2">
      <div className="flex flex-col">
        <div className="flex text-sm">
          {isPrefetched && step.description && (
            <div className="flex gap-5">
              <ExternalLinksList index={index} />
            </div>
          )}
        </div>
        <div>
          <div
            className="mt-2 text-sm cursor-pointer text-violet-500"
            onClick={() => setAddQuery(true)}>
            <b>{!addQuery ? "+ Add Data" : "Data"}</b>
          </div>

          {addQuery && <Query index={index} />}
        </div>
        <HandleNotesRender index={index} step={step} />
        <SelectInterpretation index={index} />
        <HandleExternalLinksRender index={index} step={step} />

        {!isPrefetched && (
          <div className="flex gap-2 mt-2">
            <RunButton index={index} />
            <button
              className="text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded"
              onClick={() => handleDeleteClick(index)}>
              <Tooltip title="Remove this Step">
                <Delete />
              </Tooltip>
            </button>
          </div>
        )}
        {!isPrefetched && (
          <div className="flex gap-2 mt-2">
            {step.source && (
              <div className="flex items-center gap-2">
                <CustomButton onClick={handleAdd}>Add Next Step</CustomButton>
              </div>
            )}
            {/* <CustomButton onClick={() => handleAdd(true)}>
              Add Next Step With Condition
            </CustomButton> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Step;
