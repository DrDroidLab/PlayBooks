/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  changeProgress,
  deleteStep,
  playbookSelector,
  stepsSelector,
  updateStep,
} from "../../../store/features/playbook/playbookSlice.ts";
import { Delete, PlayArrowRounded, Save } from "@mui/icons-material";
import { CircularProgress, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import {
  useCreatePlaybookMutation,
  useLazyGetAssetModelOptionsQuery,
  useUpdatePlaybookMutation,
} from "../../../store/features/playbook/api/index.ts";
import PlaybookStep from "../steps/PlaybookStep.jsx";
import { getStepTitle } from "../utils.jsx";
import { rangeSelector } from "../../../store/features/timeRange/timeRangeSlice.ts";
import {
  getTaskFromStep,
  stepsToPlaybook,
} from "../../../utils/parser/playbook/stepsToplaybook.ts";
import { useExecutePlaybookMutation } from "../../../store/features/playbook/api/index.ts";
import ExternalLinks from "../steps/ExternalLinks.jsx";
import Notes from "../steps/Notes.jsx";
import { useNavigate } from "react-router-dom";
import SavePlaybookOverlay from "../SavePlaybookOverlay.jsx";

function StepDetails() {
  const steps = useSelector(stepsSelector);
  const { currentStepIndex } = useSelector(playbookSelector);
  const [triggerGetAssetModelOptions, { isFetching }] =
    useLazyGetAssetModelOptionsQuery();
  const dispatch = useDispatch();
  const step = steps[currentStepIndex];
  const timeRange = useSelector(rangeSelector);
  const [triggerExecutePlaybook] = useExecutePlaybookMutation();
  const [links, setLinks] = useState(step?.externalLinks ?? []);
  const [showExternalLinks, setShowExternalLinks] = useState(
    step?.isPrefetched && step?.externalLinks,
  );
  const currentPlaybook = useSelector(playbookSelector);
  const navigate = useNavigate();
  const [isSavePlaybookOverlayOpen, setIsSavePlaybookOverlayOpen] =
    useState(false);
  const [triggerUpdatePlaybook, { isLoading: updateLoading }] =
    useUpdatePlaybookMutation();
  const [triggerCreatePlaybook, { isLoading: createLoading }] =
    useCreatePlaybookMutation();

  const updateCardByIndex = (key, value) => {
    dispatch(
      updateStep({
        index: currentStepIndex,
        key,
        value,
      }),
    );
  };

  function changeCardExecutionProgressStatus(status) {
    dispatch(changeProgress({ index: currentStepIndex, progress: status }));
  }

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

  const queryForStepTask = async (step, cb) => {
    if (Object.keys(step.errors ?? {}).length > 0) {
      cb({}, false);
      return;
    }

    let body = {
      playbook_task_definition: getTaskFromStep(step),
      meta: {
        time_range: timeRange,
      },
    };

    if (
      Object.keys(body?.playbook_task_definition?.documentation_task ?? {})
        .length > 0
    ) {
      cb(
        {
          step: step,
          data: null,
          timestamp: new Date().toTimeString(),
          title: getStepTitle(step),
        },
        true,
      );
      return;
    }

    try {
      const response = await triggerExecutePlaybook(body).unwrap();
      cb(
        {
          step: step,
          data: response,
          timestamp: new Date().toTimeString(),
          title: getStepTitle(step),
        },
        true,
      );
    } catch (e) {
      updateCardByIndex("outputError", e.err);
      console.error(e);
      cb(
        {
          error: e.err,
        },
        false,
      );
    }
  };

  const handleExecute = () => {
    dispatch(changeProgress({ index: currentStepIndex, progress: true }));

    updateCardByIndex("outputLoading", true);
    updateCardByIndex("showOutput", true);
    updateCardByIndex("outputError", null);
    updateCardByIndex("output", null);
    updateCardByIndex("showError", false);

    queryForStepTask(step, function (res) {
      if (Object.keys(res ?? {}).length > 0) {
        if (res.err) {
          updateCardByIndex("showOutput", true);
          updateCardByIndex("outputLoading", false);
          return;
        }
        updateCardByIndex("showOutput", true);
        updateCardByIndex("output", res);
        updateCardByIndex("outputLoading", false);
        changeCardExecutionProgressStatus(false);
      } else {
        updateCardByIndex("showError", true);
        updateCardByIndex("showOutput", false);
        updateCardByIndex("outputLoading", false);
      }
    });
  };

  const toggleExternalLinks = () => {
    setShowExternalLinks(!showExternalLinks);
  };

  const handlePlaybookSave = async ({ pbName }) => {
    setIsSavePlaybookOverlayOpen(false);

    const playbook = stepsToPlaybook(currentPlaybook, steps);

    const playbookObj = {
      playbook: {
        ...playbook,
        name: pbName,
      },
    };

    try {
      const response = await triggerCreatePlaybook(playbookObj).unwrap();
      navigate(`/playbooks/edit/${response.playbook?.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    setIsSavePlaybookOverlayOpen(true);
  };

  useEffect(() => {
    if (currentStepIndex !== null) {
      fetchData();
    }
  }, [currentStepIndex]);

  return (
    <div className="p-2 min-h-screen">
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
            onClick={handleExecute}
            className="text-violet-500 hover:text-white p-1 border-violet-500 border-[1px] text-sm rounded hover:bg-violet-500 transition-all my-2">
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
      <button
        className="text-violet-500 hover:text-white p-1 border-violet-500 border-[1px] text-sm rounded hover:bg-violet-500 transition-all my-2"
        onClick={handleSave}>
        <Save style={{ fontSize: "medium" }} />
        <span style={{ marginLeft: "2px" }} className="save_playbook">
          Save
        </span>
      </button>
      {(updateLoading || createLoading) && (
        <CircularProgress
          style={{
            textAlign: "center",
          }}
          size={20}
        />
        // </div>
      )}

      <SavePlaybookOverlay
        isOpen={isSavePlaybookOverlayOpen}
        close={() => setIsSavePlaybookOverlayOpen(false)}
        saveCallback={handlePlaybookSave}
      />
    </div>
  );
}

export default StepDetails;
