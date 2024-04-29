/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  deleteStep,
  playbookSelector,
  stepsSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { Delete, PlayArrowRounded } from "@mui/icons-material";
import { CircularProgress, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { useLazyGetAssetModelOptionsQuery } from "../../../store/features/playbook/api/index.ts";
import PlaybookStep from "../steps/PlaybookStep.jsx";
import ExternalLinks from "../steps/ExternalLinks.jsx";
import Notes from "../steps/Notes.jsx";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";
import { handleExecute } from "../../../utils/execution/handleExecute.ts";

function StepDetails() {
  const steps = useSelector(stepsSelector);
  const { currentStepIndex } = useSelector(playbookSelector);
  const [triggerGetAssetModelOptions, { isFetching }] =
    useLazyGetAssetModelOptionsQuery();
  const dispatch = useDispatch();
  const step = steps[currentStepIndex];
  const [links, setLinks] = useState(step?.externalLinks ?? []);
  const [showExternalLinks, setShowExternalLinks] = useState(
    step?.isPrefetched && step?.externalLinks,
  );

  const removeStep = () => {
    dispatch(deleteStep(currentStepIndex));
  };

  const fetchData = () => {
    triggerGetAssetModelOptions({
      connector_type: steps[currentStepIndex].source,
      model_type: steps[currentStepIndex].modelType,
      stepIndex: currentStepIndex,
    });
  };

  const toggleExternalLinks = () => {
    setShowExternalLinks(!showExternalLinks);
  };

  useEffect(() => {
    if (currentStepIndex !== null) {
      fetchData();
    }
  }, [currentStepIndex]);

  return (
    <div className="p-2 min-h-screen mb-10">
      <h2 className="font-bold mb-2 flex items-center gap-2 justify-between mr-2">
        Step Details {step?.outputLoading && <CircularProgress size={20} />}
        <button
          onClick={removeStep}
          className="text-violet-500 hover:text-white p-[1px] border-violet-500 border-[1px] rounded hover:bg-violet-500 transition-all">
          <Delete />
        </button>
      </h2>
      {!currentStepIndex ? (
        <p className="text-sm">No step selected yet</p>
      ) : (
        <>
          <div className="flex items-center justify-between pr-2">
            <div className="w-full">
              <input
                className="border-gray-300 border rounded w-full p-1 text-sm font-bold text-gray-500"
                value={step.description}
                onChange={(e) =>
                  updateCardByIndex("description", e.target.value)
                }
              />
            </div>
          </div>
          {isFetching && <CircularProgress size={20} />}
          <PlaybookStep
            card={step}
            index={currentStepIndex}
            assetsList={step.assets}
          />
          <Notes step={step} index={currentStepIndex} />
          <button
            onClick={() => handleExecute(step)}
            className="text-violet-500 mr-2 hover:text-white p-1 border-violet-500 border-[1px] text-sm rounded hover:bg-violet-500 transition-all my-2">
            <Tooltip title="Run this Step">
              Run <PlayArrowRounded />
            </Tooltip>
          </button>
        </>
      )}
      {!step?.isPrefetched && (
        <div className="my-4">
          <div
            className="font-semibold text-sm mb-2 cursor-pointer text-gray-500"
            onClick={toggleExternalLinks}>
            <b className="ext_links">{showExternalLinks ? "-" : "+"}</b> Add
            External Links
          </div>

          {showExternalLinks && (
            <ExternalLinks links={links} setLinks={setLinks} />
          )}
        </div>
      )}
    </div>
  );
}

export default StepDetails;
