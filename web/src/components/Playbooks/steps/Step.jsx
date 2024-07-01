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
import HandleNotesRender from "./HandleNotesRender.tsx";
import HandleExternalLinksRender from "./HandleExternalLinksRender.tsx";
import RunButton from "../../Buttons/RunButton/index.tsx";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import SavePlaybookButton from "../../Buttons/SavePlaybookButton/index.tsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function Step({ id: stepId }) {
  const [step] = useCurrentStep(stepId);
  const { closeDrawer } = usePermanentDrawerState();
  const isPrefetched = useIsPrefetched();
  const [addQuery, setAddQuery] = useState(
    step?.isPrefetched ?? step.source ?? false,
  );
  const dispatch = useDispatch();
  const id = step?.id;

  function handleDeleteClick() {
    dispatch(deleteStep(id));
    closeDrawer();
  }

  return (
    <div className="rounded my-2">
      <div className="flex flex-col">
        <div className="flex text-sm">
          {isPrefetched && step.description && (
            <div className="flex gap-5">
              <ExternalLinksList id={id} />
            </div>
          )}
        </div>
        <div>
          <div
            className="mt-2 text-sm cursor-pointer text-violet-500"
            onClick={() => setAddQuery(true)}>
            <b>{!addQuery ? "+ Add Data" : "Data"}</b>
          </div>

          {addQuery && <Query id={id} />}
        </div>
        <HandleNotesRender id={id} />
        <SelectInterpretation id={id} />
        <HandleExternalLinksRender id={id} />

        {!isPrefetched && (
          <div className="flex gap-2 mt-2">
            <RunButton id={id} />
            <button
              className="text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded"
              onClick={handleDeleteClick}>
              <Tooltip title="Remove this Step">
                <Delete />
              </Tooltip>
            </button>
          </div>
        )}
        {!isPrefetched && (
          <div className="flex mt-2">
            <SavePlaybookButton shouldNavigate={false} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Step;
