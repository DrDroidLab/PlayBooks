/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLazyGetPlaybookExecutionQuery } from "../../../store/features/playbook/api/logs/index.ts";
import Loading from "../../common/Loading/index.tsx";
import Heading from "../../Heading.js";
import { playbookToSteps } from "../../../utils/parser/playbook/playbookToSteps.ts";
import { getAssetModelOptions } from "../../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  resetState,
  setCurrentStepIndex,
  setSteps,
} from "../../../store/features/playbook/playbookSlice.ts";
import GlobalVariables from "../../common/GlobalVariable/index.jsx";
import {
  resetTimeRange,
  setPlaybookState,
  updateCustomTimeRange,
} from "../../../store/features/timeRange/timeRangeSlice.ts";
import CustomDrawer from "../../common/CustomDrawer/index.jsx";
import CreateFlow from "../create/CreateFlow.jsx";
import StepDetails from "../create/StepDetails.jsx";

function PlaybookLog() {
  const { playbook_run_id } = useParams();
  const dispatch = useDispatch();
  const [triggerGetPlaybookLog, { data, isLoading }] =
    useLazyGetPlaybookExecutionQuery();
  const { currentStepIndex } = useSelector(playbookSelector);
  const playbook = data?.playbook_execution?.playbook;
  const timeRange = data?.playbook_execution?.time_range;
  const outputs = data?.playbook_execution?.logs;

  useEffect(() => {
    if (playbook_run_id) {
      triggerGetPlaybookLog({ playbookRunId: playbook_run_id });
    }
  }, [playbook_run_id]);

  useEffect(() => {
    if (playbook && Object.keys(playbook).length > 0) {
      populateData();
      dispatch(
        updateCustomTimeRange({
          value: "Custom",
          startTime: timeRange.time_geq,
          endTime: timeRange.time_geq,
        }),
      );
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
      console.log("pbdata", pbData);
      console.log("output", output);
      const stepIndex = pbData.findIndex((step) => step.id === output.step.id);
      if (stepIndex === isNaN) continue;
      const step = pbData[stepIndex];
      console.log("step", step);
      if (step) {
        step.showOutput = true;
        step.output = output;
      }
    }

    console.log(pbData);

    dispatch(setSteps(pbData));
  };

  return (
    <div className="flex flex-col h-screen">
      <Heading heading={playbook.name} customTimeRange={true} />
      <main className="relative flex h-[calc(100%-80px)]">
        <div className="absolute top-2 left-2 z-10 bg-white p-1 rounded w-48">
          <GlobalVariables />
        </div>
        <div className="flex-[1] h-full">
          <CreateFlow />
        </div>
        <CustomDrawer
          isOpen={currentStepIndex}
          setIsOpen={() => dispatch(setCurrentStepIndex(null))}
          addtionalStyles={"lg:w-[30%]"}
          showOverlay={false}
          startFrom="80">
          <div className="flex-[0.4] border-l-[1px] border-l-gray-200 h-full overflow-scroll">
            <StepDetails />
          </div>
        </CustomDrawer>
      </main>
    </div>
  );
}

export default PlaybookLog;
