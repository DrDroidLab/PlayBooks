/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Heading from "../../Heading";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  resetState,
  setPlaybookData,
  setSteps,
  setView,
} from "../../../store/features/playbook/playbookSlice.ts";
import {
  resetTimeRange,
  setPlaybookState,
  updateCustomTimeRange,
} from "../../../store/features/timeRange/timeRangeSlice.ts";
import { useParams } from "react-router-dom";
import Loading from "../../common/Loading/index.tsx";
import TabsComponent from "../../common/TabsComponent/index.tsx";
import { useLazyGetPlaybookExecutionQuery } from "../../../store/features/playbook/api/logs/getPlaybookExecutionApi.ts";
import { executionToPlaybook } from "../../../utils/parser/playbook/executionToPlaybook.ts";
import Builder from "../create/Builder.jsx";
import ListView from "../ListView.jsx";

const viewOptions = [
  {
    id: "step",
    label: "List",
  },
  {
    id: "builder",
    label: "Builder",
  },
];

function PlaybookLogs() {
  const { playbook_run_id } = useParams();
  const dispatch = useDispatch();
  const [triggerGetPlaybookLog, { data, isLoading }] =
    useLazyGetPlaybookExecutionQuery();
  const { view } = useSelector(playbookSelector);
  const playbook = data?.playbook_execution?.playbook;
  const timeRange = data?.playbook_execution?.time_range;

  useEffect(() => {
    if (playbook_run_id) {
      triggerGetPlaybookLog({ playbookRunId: playbook_run_id });
    }
  }, [playbook_run_id]);

  useEffect(() => {
    if (playbook && Object.keys(playbook).length > 0) {
      populateData();
      dispatch(setPlaybookData(playbook));
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
    const pbData = executionToPlaybook(data?.playbook_execution);
    dispatch(setSteps(pbData));
  };

  const handleSelect = (_, option) => {
    dispatch(setView(option.id));
  };

  return (
    <div className="h-screen overflow-hidden">
      <Heading
        heading={playbook.name}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
        customTimeRange={true}
      />
      <div className="flex flex-col h-[calc(100%-80px)]">
        <main className="relative flex flex-1">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <TabsComponent
              options={viewOptions}
              handleSelect={handleSelect}
              selectedId={view}
            />
          </div>
          {view === "step" ? (
            <div className="flex justify-center w-full absolute top-14 h-[calc(100%-3.5rem)]">
              <ListView />
            </div>
          ) : (
            <Builder isLog={true} />
          )}
        </main>
      </div>
    </div>
  );
}

export default PlaybookLogs;
