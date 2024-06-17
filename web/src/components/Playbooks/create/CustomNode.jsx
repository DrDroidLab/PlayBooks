import React from "react";
import { Handle, NodeToolbar, Position } from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import {
  addStep,
  deleteStep,
  playbookSelector,
  setCurrentStepIndex,
} from "../../../store/features/playbook/playbookSlice.ts";
import { cardsData } from "../../../utils/cardsData.js";
import { CircularProgress } from "@mui/material";
import {
  Add,
  CheckCircleOutline,
  Delete,
  ErrorOutline,
} from "@mui/icons-material";
import CustomButton from "../../common/CustomButton/index.tsx";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

const addDataId = DrawerTypes.ADD_DATA;

export default function CustomNode({ data }) {
  const { toggle: toggleAddData, addAdditionalData } =
    useDrawerState(addDataId);
  const { openDrawer } = usePermanentDrawerState();
  const dispatch = useDispatch();
  const { currentStepIndex, executionId } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;
  const step = data.step;
  const source = `node-${step?.stepIndex}`;
  const target = `node-${step?.stepIndex + 1}`;

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    if (!isEditing) return;
    dispatch(setCurrentStepIndex(data.index));
    openDrawer(PermanentDrawerTypes.STEP_DETAILS);
  };

  const handleDelete = (e) => {
    handleNoAction(e);
    if (!isEditing) return;
    dispatch(deleteStep(data.index));
  };

  const handleAdd = (e) => {
    handleNoAction(e);
    if (!isEditing) return;
    toggleAddData();
    addAdditionalData({ parentIndex: data.index });
  };

  const handleAddWithCondition = (e) => {
    handleNoAction(e);
    if (!isEditing) return;
    dispatch(addStep({ parentIndex: step?.stepIndex }));
    addAdditionalData({
      source,
      target,
    });
    openDrawer(PermanentDrawerTypes.CONDITION);
  };

  return (
    <>
      <div
        className={`${
          currentStepIndex === data.index.toString() ? "shadow-violet-500" : ""
        } px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-[200px] h-48 cursor-pointer transition-all hover:shadow-violet-500`}
        onClick={handleClick}>
        <div className="">
          {(step.outputLoading || step.inprogress) && (
            <CircularProgress size={20} />
          )}
          {(step.outputError ||
            Object.keys(data?.step?.errors ?? {}).length > 0) && (
            <ErrorOutline color="error" size={20} />
          )}
          {!step.outputError &&
            !step.outputLoading &&
            step.showOutput &&
            step.outputs?.data?.length > 0 &&
            Object.keys(data?.step?.errors ?? {}).length === 0 && (
              <CheckCircleOutline color="success" size={20} />
            )}
        </div>

        {isEditing && (
          <div
            className="absolute top-0 right-0 m-2 text-violet-500"
            onClick={handleDelete}>
            <Delete fontSize="medium" />
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {data?.step?.source && (
            <img
              className="w-10 h-10"
              src={
                cardsData.find(
                  (e) => e.enum === data?.step?.source.replace("_VPC", ""),
                )?.url ?? ""
              }
              alt="logo"
            />
          )}
          <p className="text-lg font-bold text-center z-10 break-word line-clamp-3">
            {data?.step?.description ||
              data?.step?.selectedSource ||
              `Step - ${data?.index + 1}`}
          </p>
        </div>

        <Handle
          type="target"
          position={Position.Top}
          className="!bg-white !w-5 !h-5 absolute !top-0 !transform !-translate-x-1/2 !-translate-y-1/2 !border-violet-500 !border-2"
        />

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-white !w-5 !h-5 absolute !bottom-0 !transform !-translate-x-1/2 !translate-y-1/2 !border-violet-500 !border-2"
        />

        {isEditing && (
          <NodeToolbar isVisible={true} position={Position.Bottom}>
            <CustomButton
              onClick={handleNoAction}
              className="rounded-full w-8 h-8 flex items-center justify-center p-0 text-xl add-button hover:rotate-45">
              <Add fontSize="inherit" />
            </CustomButton>

            <div className="absolute top-0 left-full add-step-buttons transition-all">
              <div className="flex flex-col gap-2 m-2 mt-0">
                <CustomButton className="w-fit" onClick={handleAdd}>
                  Add Step
                </CustomButton>
                <CustomButton
                  onClick={handleAddWithCondition}
                  className="whitespace-nowrap">
                  Add Step with Condition
                </CustomButton>
              </div>
            </div>
          </NodeToolbar>
        )}
      </div>

      <div className="absolute top-0 left-0 w-screen"></div>
    </>
  );
}
