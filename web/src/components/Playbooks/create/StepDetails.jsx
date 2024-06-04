/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  addExternalLinks,
  deleteStep,
  playbookSelector,
  stepsSelector,
  toggleExternalLinkVisibility,
} from "../../../store/features/playbook/playbookSlice.ts";
import { Delete, PlayArrowRounded } from "@mui/icons-material";
import { CircularProgress, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import PlaybookStep from "../steps/PlaybookStep.jsx";
import ExternalLinks from "../steps/ExternalLinks.jsx";
import Notes from "../steps/Notes.jsx";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";
import AddSource from "../steps/AddSource.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import Interpretation from "../steps/Interpretation.jsx";
import { unsupportedRunners } from "../../../utils/unsupportedRunners.ts";
import ExternalLinksList from "../../common/ExternalLinksList/index.tsx";
import { fetchData } from "../../../utils/fetchAssetModelOptions.ts";

function StepDetails() {
  const steps = useSelector(stepsSelector);
  const { currentStepIndex } = useSelector(playbookSelector);
  const dispatch = useDispatch();
  const step = steps[currentStepIndex];
  const isPrefetched = useIsPrefetched();

  const removeStep = () => {
    dispatch(deleteStep(currentStepIndex));
  };

  useEffect(() => {
    if (
      currentStepIndex !== null &&
      step?.source &&
      step?.modelType &&
      step.connectorType
    ) {
      fetchData({ index: currentStepIndex });
    }
  }, [currentStepIndex, step?.source, step?.modelType, step?.connectorType]);

  const toggleExternalLinks = () => {
    dispatch(toggleExternalLinkVisibility(currentStepIndex));
  };

  const setLinks = (links) => {
    dispatch(addExternalLinks({ index: currentStepIndex, links }));
  };

  return (
    <div className="p-2 min-h-screen mb-16">
      <h2 className="font-bold mb-2 flex items-center gap-2 justify-between mr-2">
        Step Title {step?.outputLoading && <CircularProgress size={20} />}
        {!isPrefetched && (
          <button
            onClick={removeStep}
            className="text-violet-500 hover:text-white p-[1px] border-violet-500 border-[1px] rounded hover:bg-violet-500 transition-all">
            <Delete />
          </button>
        )}
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
                disabled={isPrefetched}
              />
            </div>
          </div>
          <ExternalLinksList />
          <AddSource />
          <PlaybookStep />
          <Notes />
          <Interpretation />
          {!isPrefetched && !unsupportedRunners.includes(step.source) && (
            <button
              onClick={() => executeStep(step)}
              className="text-violet-500 mr-2 hover:text-white p-1 border-violet-500 border-[1px] text-sm rounded hover:bg-violet-500 transition-all my-2">
              <Tooltip title="Run this Step">
                Run <PlayArrowRounded />
              </Tooltip>
            </button>
          )}
        </>
      )}
      {!isPrefetched && (
        <div className="my-4">
          <div
            className="font-semibold text-sm mb-2 cursor-pointer text-gray-500"
            onClick={toggleExternalLinks}>
            <b className="ext_links">{step?.showExternalLinks ? "-" : "+"}</b>{" "}
            Add External Links
          </div>

          {step?.showExternalLinks && (
            <ExternalLinks links={step?.externalLinks} setLinks={setLinks} />
          )}
        </div>
      )}
    </div>
  );
}

export default StepDetails;
