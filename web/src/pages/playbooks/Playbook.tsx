import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import usePermanentDrawerState from "../../hooks/common/usePermanentDrawerState";
import { useParams, useSearchParams } from "react-router-dom";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched";
import {
  useLazyGetPlaybookQuery,
  usePlaybookBuilderOptionsQuery,
} from "../../store/features/playbook/api";
import {
  resetExecutions,
  resetState,
  setPlaybookKey,
} from "../../store/features/playbook/playbookSlice";
import { resetDrawerState } from "../../store/features/drawers/drawersSlice";
import { resetTimeRange } from "../../store/features/timeRange/timeRangeSlice";
import { Playbook as PlaybookType } from "../../types";
import { PermanentDrawerTypes } from "../../store/features/drawers/permanentDrawerTypes";
import Loading from "../../components/common/Loading";
import Heading from "../../components/Heading";
import Builder from "../../components/Playbooks/create/Builder";
import CustomButton from "../../components/common/CustomButton";
import PermenantDrawer from "../../components/common/PermenantDrawer";

function Playbook() {
  const { openDrawer, permanentView } = usePermanentDrawerState();
  const { playbook_id: id } = useParams();
  const dispatch = useDispatch();
  const playbookDataRef = useRef<PlaybookType | null>(null);
  const [searchParams] = useSearchParams();
  const executionId = searchParams.get("executionId");
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;
  const { data, isLoading: builderOptionsLoading } =
    usePlaybookBuilderOptionsQuery();
  const [triggerGetPlaybook, { isLoading }] = useLazyGetPlaybookQuery();

  useEffect(() => {
    dispatch(setPlaybookKey({ key: "executionId", value: executionId }));
    if (!executionId) {
      dispatch(resetExecutions());
      dispatch(resetDrawerState());
    }
  }, [executionId, dispatch]);

  useEffect(() => {
    dispatch(setPlaybookKey({ key: "isOnPlaybookPage", value: true }));
    return () => {
      dispatch(resetState());
      dispatch(resetDrawerState());
      dispatch(resetTimeRange());
    };
  }, [dispatch]);

  const fetchPlaybook = async () => {
    if (!id) return;
    const res = await triggerGetPlaybook({ playbookId: id }).unwrap();
    if (playbookDataRef) playbookDataRef.current = res;
    if (executionId) handleTimeline();
  };

  const handleTimeline = () => {
    openDrawer(PermanentDrawerTypes.TIMELINE);
  };

  useEffect(() => {
    if ((id || executionId) && data) {
      fetchPlaybook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, executionId, data]);

  if (isLoading || builderOptionsLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Heading heading={"Untitled Playbook"} />
      <div className="flex h-[calc(100%-80px)]">
        <main className="relative flex flex-1">
          <Builder isLog={!!isPrefetched} />
          {!isEditing && (
            <div
              className={`${
                permanentView === PermanentDrawerTypes.DEFAULT
                  ? "top-2"
                  : "top-12"
              } absolute right-2 flex items-end flex-col gap-2 z-10`}>
              {permanentView !== PermanentDrawerTypes.TIMELINE && (
                <CustomButton onClick={handleTimeline}>
                  View Timeline
                </CustomButton>
              )}
            </div>
          )}
        </main>
        <PermenantDrawer />
      </div>
    </div>
  );
}

export default Playbook;
