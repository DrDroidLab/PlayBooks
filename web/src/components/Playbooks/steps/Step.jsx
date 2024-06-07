/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { CircularProgress, Tooltip } from "@mui/material";
import Notes from "./Notes.jsx";
import { useDispatch } from "react-redux";
import {
  addExternalLinks,
  deleteStep,
  toggleExternalLinkVisibility,
  toggleNotesVisibility,
} from "../../../store/features/playbook/playbookSlice.ts";
import ExternalLinks from "./ExternalLinks.jsx";
import Query from "./Query.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { unsupportedRunners } from "../../../utils/unsupportedRunners.ts";
import ExternalLinksList from "../../common/ExternalLinksList/index.tsx";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import SelectInterpretation from "./Interpretation.jsx";
import { Delete, PlayArrowRounded } from "@mui/icons-material";

function Step({ step, index }) {
  const isPrefetched = useIsPrefetched();
  const [addQuery, setAddQuery] = useState(
    step?.isPrefetched ?? step.source ?? false,
  );
  const dispatch = useDispatch();

  function handleDeleteClick() {
    dispatch(deleteStep(index));
  }

  const toggleExternalLinks = () => {
    dispatch(toggleExternalLinkVisibility({ index }));
  };

  const toggleNotes = () => {
    dispatch(toggleNotesVisibility({ index }));
  };

  const setLinks = (links) => {
    dispatch(addExternalLinks({ links, index }));
  };

  const handleExecuteStep = () => {
    executeStep(step, index);
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
        {isPrefetched && !step.isCopied ? (
          step.notes && (
            <>
              <div className="mt-2 text-sm cursor-pointer text-violet-500">
                <b>Notes</b>
              </div>
              <Notes step={step} index={index} />
            </>
          )
        ) : (
          <>
            <div
              className="mt-2 text-sm cursor-pointer text-violet-500"
              onClick={toggleNotes}>
              <b>{step.showNotes ? "-" : "+"}</b> Add Notes about this step
            </div>
            {step.showNotes && <Notes step={step} index={index} />}
          </>
        )}
        <SelectInterpretation index={index} />
        {!isPrefetched && (
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
                {step.outputLoading && <CircularProgress size={20} />}
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
