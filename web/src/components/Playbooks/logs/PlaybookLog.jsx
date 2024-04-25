/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLazyGetPlaybookExecutionQuery } from "../../../store/features/playbook/api/logs/index.ts";
import Loading from "../../common/Loading/index.tsx";
import Heading from "../../Heading.js";
import { playbookToSteps } from "../../../utils/parser/playbooks/playbookToSteps.ts";
import { getAssetModelOptions } from "../../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  resetState,
  setSteps,
  toggleStep,
  updateStep,
} from "../../../store/features/playbook/playbookSlice.ts";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import PlaybookTitle from "../../common/PlaybookTitle.jsx";
import { ArrowDropDown } from "@mui/icons-material";
import GlobalVariables from "../../common/GlobalVariable/index.jsx";
import styles from "./playbooks.module.css";
import Step from "./Step.jsx";
import {
  resetTimeRange,
  setPlaybookState,
} from "../../../store/features/timeRange/timeRangeSlice.ts";

function PlaybookLog() {
  const { playbook_run_id } = useParams();
  const dispatch = useDispatch();
  const [triggerGetPlaybookLog, { data, isLoading }] =
    useLazyGetPlaybookExecutionQuery();
  const { steps } = useSelector(playbookSelector);
  const playbook = data?.playbook_execution?.playbook;
  const outputs = data?.playbook_execution?.logs;

  useEffect(() => {
    if (playbook_run_id) {
      triggerGetPlaybookLog({ playbookRunId: playbook_run_id });
    }
  }, [playbook_run_id]);

  useEffect(() => {
    if (playbook && Object.keys(playbook).length > 0) {
      populateData();
    }
  }, [playbook]);

  useEffect(() => {
    dispatch(setPlaybookState());
    return () => {
      dispatch(resetState());
      dispatch(resetTimeRange());
    };
  }, [dispatch]);

  if (isLoading || !playbook_run_id) {
    return <Loading />;
  }

  if (!data) {
    return <></>;
  }

  const updateCardByIndex = (index, key, value) => {
    dispatch(
      updateStep({
        index,
        key,
        value,
      }),
    );
  };

  const populateData = () => {
    const pbData = playbookToSteps(playbook);
    const assetModelPromises = pbData.map((el, i) =>
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

    for (let output of outputs) {
      const stepIndex = pbData.findIndex((step) => step.id === output.step.id);
      if (stepIndex === isNaN) continue;
      const step = pbData[stepIndex];
      step.showOutput = true;
      step.output = output;
    }

    dispatch(setSteps(pbData));
  };

  return (
    <div className="flex flex-col h-screen">
      <Heading heading={playbook.name} customTimeRange={true} />
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
                  expandIcon={<ArrowDropDown />}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaybookLog;
