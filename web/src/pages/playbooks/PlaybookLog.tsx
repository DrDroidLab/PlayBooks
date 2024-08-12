import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useLazyGetPlaybookExecutionQuery } from "../../store/features/playbook/api";
import { useEffect } from "react";
import {
  resetTimeRange,
  updateCustomTimeRange,
} from "../../store/features/timeRange/timeRangeSlice";
import {
  setPlaybookData,
  resetState,
} from "../../store/features/playbook/playbookSlice";
import Loading from "../../components/common/Loading";
import Heading from "../../components/Heading";
import Builder from "../../components/Playbooks/create/Builder";

function PlaybookLog() {
  const { playbook_run_id } = useParams();
  const dispatch = useDispatch();
  const [triggerGetPlaybookLog, { data, isLoading }] =
    useLazyGetPlaybookExecutionQuery();
  const playbook = (data as any)?.playbook_execution?.playbook;
  const timeRange = (data as any)?.playbook_execution?.time_range;

  useEffect(() => {
    if (playbook_run_id) {
      triggerGetPlaybookLog();
    }
  }, [playbook_run_id]);

  useEffect(() => {
    if (playbook && Object.keys(playbook).length > 0) {
      dispatch(setPlaybookData(playbook));
      dispatch(
        updateCustomTimeRange({
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

  return (
    <div className="h-screen overflow-hidden">
      <Heading heading={playbook.name} />
      <div className="flex flex-col h-[calc(100%-80px)]">
        <main className="relative flex flex-1">
          <Builder />
        </main>
      </div>
    </div>
  );
}

export default PlaybookLog;
