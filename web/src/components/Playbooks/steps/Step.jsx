/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { CircularProgress, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  addExternalLinks,
  deleteStep,
  playbookSelector,
  setPlaybookKey,
  toggleExternalLinkVisibility,
} from "../../../store/features/playbook/playbookSlice.ts";
import ExternalLinks from "./ExternalLinks.jsx";
import Query from "./Query.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { unsupportedRunners } from "../../../utils/unsupportedRunners.ts";
import ExternalLinksList from "../../common/ExternalLinksList/index.tsx";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import SelectInterpretation from "./Interpretation.jsx";
import { Delete, PlayArrowRounded } from "@mui/icons-material";
import useIsExisting from "../../../hooks/useIsExisting.ts";
import HandleNotesRender from "./HandleNotesRender.jsx";
import { useStartExecutionMutation } from "../../../store/features/playbook/api/index.ts";
import { useSearchParams } from "react-router-dom";

function Step({ step, index }) {
  const { executionId, currentPlaybook } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const isExisting = useIsExisting();
  const [addQuery, setAddQuery] = useState(
    step?.isPrefetched ?? step.source ?? false,
  );
  const [, setSearchParams] = useSearchParams();
  const [triggerStartExecution, { isLoading: executionLoading }] =
    useStartExecutionMutation();
  const dispatch = useDispatch();

  function handleDeleteClick() {
    dispatch(deleteStep(index));
  }

  const toggleExternalLinks = () => {
    dispatch(toggleExternalLinkVisibility({ index }));
  };

  const setLinks = (links) => {
    dispatch(addExternalLinks({ links, index }));
  };

  const handleStartExecution = async () => {
    if (executionId) return;
    const response = await triggerStartExecution(currentPlaybook.id);
    if ("data" in response) {
      const { data } = response;
      return data.playbook_run_id;
    }
  };

  const handleExecuteStep = async () => {
    if (isExisting) {
      const executionId = await handleStartExecution();
      dispatch(setPlaybookKey({ key: "executionId", value: executionId }));
      await executeStep(step, index);
      setSearchParams({ executionId });
    } else {
      executeStep(step, index);
    }
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
        {isExisting && (
          <div>
            <div>
              <div
                className="mt-2 m-1 ml-0 text-sm cursor-pointer text-violet-500"
                onClick={toggleExternalLinks}>
                <b>{step.showExternalLinks ? "-" : "+"}</b> Add External Links
              </div>

              {step.showExternalLinks && (
                <ExternalLinks links={step.externalLinks} setLinks={setLinks} />
              )}
            </div>
          </div>
        )}

        {!isPrefetched && (
          <div className="flex gap-2 mt-2">
            {step.source && !unsupportedRunners.includes(step.source) && (
              <div className="flex items-center gap-2">
                <button
                  className="text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded"
                  onClick={handleExecuteStep}>
                  <Tooltip title="Run this Step">
                    <>
                      Run <PlayArrowRounded />
                    </>
                  </Tooltip>
                </button>
                {(step.outputLoading || executionLoading) && (
                  <CircularProgress size={20} />
                )}
              </div>
            )}
            <button
              className="text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded"
              onClick={() => handleDeleteClick(index)}>
              <Tooltip title="Remove this Step">
                <Delete />
              </Tooltip>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Step;
