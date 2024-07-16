/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Heading from "../../Heading";
import { useDispatch } from "react-redux";
import {
  resetState,
  setPlaybookData,
  setSteps,
} from "../../../store/features/playbook/playbookSlice.ts";
import {
  resetTimeRange,
  updateCustomTimeRange,
} from "../../../store/features/timeRange/timeRangeSlice.ts";
import { useParams } from "react-router-dom";
import Loading from "../../common/Loading/index.tsx";
import { useLazyGetPlaybookExecutionQuery } from "../../../store/features/playbook/api/logs/getPlaybookExecutionApi.ts";
import { executionToPlaybook } from "../../../utils/parser/playbook/executionToPlaybook.ts";
import Builder from "../create/Builder.jsx";

function PlaybookLogs() {
  const { playbook_run_id } = useParams();
  const dispatch = useDispatch();
  const [triggerGetPlaybookLog, { data, isLoading }] =
    useLazyGetPlaybookExecutionQuery();
  const playbook = data?.playbook_execution?.playbook;
  const timeRange = data?.playbook_execution?.time_range;

  useEffect(() => {
    if (playbook_run_id) {
      triggerGetPlaybookLog();
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
          <Builder isLog={true} />
        </main>
      </div>
    </div>
  );
}

export default PlaybookLogs;
