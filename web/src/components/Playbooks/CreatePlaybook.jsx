/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import Heading from "../../components/Heading";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import styles from "./playbooks.module.css";
import {
  getAssetModelOptions,
  useExecutePlaybookMutation,
} from "../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  copyPlaybook,
  playbookSelector,
  resetState,
  setSteps,
  toggleStep,
  updateStep,
} from "../../store/features/playbook/playbookSlice.ts";
import { playbookToSteps } from "../../utils/playbookToSteps.ts";
import Step from "./steps/Step.jsx";
import StepActions from "./StepActions.jsx";
import { getStepTitle } from "./utils.jsx";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PlaybookTitle from "../common/PlaybookTitle.jsx";
import GlobalVariables from "../common/GlobalVariable/index.jsx";
import {
  rangeSelector,
  resetTimeRange,
  setPlaybookState,
} from "../../store/features/timeRange/timeRangeSlice.ts";
import { useNavigate } from "react-router-dom";
import Loading from "../common/Loading/index.tsx";
import { showSnackbar } from "../../store/features/snackbar/snackbarSlice.ts";
import { useLazyGetPlaybookQuery } from "../../store/features/playbook/api/index.ts";
import { getTaskFromStep } from "../../utils/stepsToplaybook.ts";

const CreatePlaybook = ({ playbook, allowSave = true }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [triggerGetPlaybook, { isFetching: copyLoading }] =
    useLazyGetPlaybookQuery();
  const { steps, isEditing } = useSelector(playbookSelector);
  const [triggerExecutePlaybook] = useExecutePlaybookMutation();
  const [outputs, setOutputs] = useState([]);
  const timeRange = useSelector(rangeSelector);
  const copied = useRef(false);

  const populateData = () => {
    const data = playbookToSteps(playbook);
    const assetModelPromises = data.map((el, i) =>
      dispatch(
        getAssetModelOptions.initiate(
          {
            connector_type: el.source,
            model_type: el.modelType,
            stepIndex: i,
          },
          {
            forceRefetch: true,
          },
        ),
      ).unwrap(),
    );

    Promise.all(assetModelPromises).catch((err) => {
      console.log("Error: ", err);
    });

    dispatch(setSteps(data));
  };

  const updateCardByIndex = (index, key, value) => {
    dispatch(
      updateStep({
        index,
        key,
        value,
      }),
    );
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
      if (!response?.success) {
        dispatch(
          showSnackbar(
            response?.task_execution_result?.error || "There was an error",
          ),
        );
        cb({}, false);
        return;
      }
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
      console.error(e);
      cb(
        {
          error: e.err,
        },
        false,
      );
    }
  };

  const handleGlobalExecute = () => {
    const promises = steps.map((card, i) => {
      return new Promise((resolve, reject) => {
        updateCardByIndex(i, "outputLoading", true);
        updateCardByIndex(i, "showOutput", false);
        updateCardByIndex(i, "outputError", null);
        updateCardByIndex(i, "output", null);
        updateCardByIndex(i, "showError", false);

        queryForStepTask(card, function (res) {
          if (Object.keys(res ?? {}).length > 0) {
            updateCardByIndex(i, "outputError", res.error);
            updateCardByIndex(i, "showOutput", true);
            updateCardByIndex(i, "output", res);
            updateCardByIndex(i, "outputLoading", false);
            resolve(res);
          } else {
            updateCardByIndex(i, "showError", true);
            updateCardByIndex(i, "showOutput", false);
            updateCardByIndex(i, "outputLoading", false);
            reject();
          }
        });
      });
    });

    Promise.all(promises).then((responses) => {
      setOutputs(responses.concat(outputs));
    });
  };

  const handleCopyPlaybook = async () => {
    const res = await triggerGetPlaybook({ playbookId: playbook.id }).unwrap();
    dispatch(copyPlaybook(res));
    copied.current = true;
    navigate("/playbooks/create", {
      replace: true,
    });
  };

  useEffect(() => {
    dispatch(setPlaybookState());
    return () => {
      if (!copied.current) dispatch(resetState());
      dispatch(resetTimeRange());
    };
  }, [dispatch]);

  useEffect(() => {
    if (playbook && Object.keys(playbook).length > 0) {
      populateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbook]);

  if (copyLoading) {
    return <Loading title="Copying your playbook..." />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Heading
        heading={
          playbook
            ? `${isEditing ? "Editing" : ""} Playbook` +
              (playbook.name ? " - " + playbook.name : "")
            : "Untitled Playbook"
        }
        handleGlobalExecute={handleGlobalExecute}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
        showRunAll={steps?.length > 0}
        showEditTitle={!playbook}
        customTimeRange={true}
        showCopy={!!playbook}
        copyPlaybook={handleCopyPlaybook}
      />
      <div className={styles["pb-container"]}>
        <div className={styles["global-variables-pane"]}>
          <GlobalVariables />
        </div>
        <div className={styles["step-cards-pane"]}>
          <div className={styles.steps}>
            {steps?.map((step, index) => (
              <Accordion
                style={{ borderRadius: "5px" }}
                className="collapsible_option"
                defaultExpanded={step.isPrefetched ? false : true}
                expanded={step.isOpen}
                onChange={() => dispatch(toggleStep({ index }))}>
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  style={{ borderRadius: "5px", backgroundColor: "#f5f5f5" }}>
                  <PlaybookTitle
                    step={step}
                    index={index}
                    updateCardByIndex={updateCardByIndex}
                  />
                </AccordionSummary>
                <AccordionDetails sx={{ padding: "0" }}>
                  <Step key={index} step={step} index={index} />
                </AccordionDetails>
              </Accordion>
            ))}
            <StepActions allowSave={allowSave} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaybook;
