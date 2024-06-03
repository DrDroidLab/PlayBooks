/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import Heading from "../../components/Heading";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import styles from "./playbooks.module.css";
import { getAssetModelOptions } from "../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  copyPlaybook,
  playbookSelector,
  resetState,
  setSteps,
  toggleStep,
  updateStep,
} from "../../store/features/playbook/playbookSlice.ts";
import { playbookToSteps } from "../../utils/parser/playbook/playbookToSteps.ts";
import Step from "./steps/Step.jsx";
import StepActions from "./StepActions.jsx";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PlaybookTitle from "../common/PlaybookTitle.jsx";
import GlobalVariables from "../common/GlobalVariable/index.jsx";
import {
  resetTimeRange,
  setPlaybookState,
} from "../../store/features/timeRange/timeRangeSlice.ts";
import { useNavigate } from "react-router-dom";
import Loading from "../common/Loading/index.tsx";
import { useLazyGetPlaybookQuery } from "../../store/features/playbook/api/index.ts";
import useIsPrefetched from "../../hooks/useIsPrefetched.ts";

const CreatePlaybook = ({ playbook, allowSave = true, showHeading = true }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [triggerGetPlaybook, { isFetching: copyLoading }] =
    useLazyGetPlaybookQuery();
  const { steps, isEditing, currentStepIndex } = useSelector(playbookSelector);
  const copied = useRef(false);
  const isPrefetched = useIsPrefetched();

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
      if (!copied.current && showHeading) dispatch(resetState());
      if (showHeading) dispatch(resetTimeRange());
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
    <div className="flex flex-col h-full w-full lg:w-2/3 m-auto">
      {showHeading && (
        <Heading
          heading={
            playbook
              ? `${isEditing ? "Editing" : ""} Playbook` +
                (playbook.name ? " - " + playbook.name : "")
              : "Untitled Playbook"
          }
          onTimeRangeChangeCb={false}
          onRefreshCb={false}
          showRunAll={steps?.length > 0}
          showEditTitle={!playbook}
          customTimeRange={true}
          showCopy={!!playbook}
          copyPlaybook={handleCopyPlaybook}
        />
      )}
      <div className={styles["pb-container"]}>
        <div className={styles["global-variables-pane"]}>
          <GlobalVariables />
        </div>
        <div className="flex-1 p-1 bg-white border rounded m-2 overflow-scroll">
          <div className={styles.steps}>
            {steps?.map((step, index) => (
              <Accordion
                key={index}
                style={{ borderRadius: "5px" }}
                className="collapsible_option"
                defaultExpanded={index === currentStepIndex ? false : true}
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
            {!isPrefetched && <StepActions allowSave={allowSave} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaybook;
