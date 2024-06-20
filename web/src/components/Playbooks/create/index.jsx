import React, { useEffect, useRef } from "react";
import Heading from "../../Heading";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  resetState,
  setPlaybookDataBeta,
  setView,
  setPlaybookKey,
} from "../../../store/features/playbook/playbookSlice.ts";
import {
  resetTimeRange,
  setPlaybookState,
} from "../../../store/features/timeRange/timeRangeSlice.ts";
import { useParams, useSearchParams } from "react-router-dom";
import { useLazyGetPlaybookQuery } from "../../../store/features/playbook/api/getPlaybookApi.ts";
import Loading from "../../common/Loading/index.tsx";
import ListView from "../ListView.jsx";
import Builder from "./Builder.jsx";
import TabsComponent from "../../common/TabsComponent/index.tsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import PermenantDrawer from "../../common/PermenantDrawer/index.tsx";
import CustomButton from "../../common/CustomButton/index.tsx";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import { resetDrawerState } from "../../../store/features/drawers/drawersSlice.ts";

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

function CreatePlaybook() {
  const { openDrawer, permanentView } = usePermanentDrawerState();
  const { playbook_id: id } = useParams();
  const playbook = useSelector(playbookSelector);
  const dispatch = useDispatch();
  const playbookDataRef = useRef(null);
  const [searchParams] = useSearchParams();
  const executionId = searchParams.get("executionId");
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;

  useEffect(() => {
    dispatch(setPlaybookKey({ key: "executionId", value: executionId }));
  }, [executionId, dispatch]);

  useEffect(() => {
    dispatch(setPlaybookState());
    return () => {
      dispatch(resetState());
      dispatch(resetDrawerState());
      dispatch(resetTimeRange());
    };
  }, [dispatch]);

  const [triggerGetPlaybook, { isLoading }] = useLazyGetPlaybookQuery();

  const fetchPlaybook = async () => {
    const res = await triggerGetPlaybook({ playbookId: id }).unwrap();
    playbookDataRef.current = res;
    dispatch(setPlaybookDataBeta(res));
  };

  const handleSelect = (_, option) => {
    dispatch(setView(option.id));
  };

  const handleTimeline = () => {
    openDrawer(PermanentDrawerTypes.TIMELINE);
  };

  useEffect(() => {
    if (id) {
      fetchPlaybook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (executionId) {
      handleTimeline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Heading
        heading={
          playbook
            ? `${playbook.isEditing ? "Editing" : ""} Playbook` +
              (playbook.name ? " - " + playbook.name : "")
            : "Untitled Playbook"
        }
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
        customTimeRange={true}
        showEditTitle={playbook}
        showRunAll={true}
      />
      <div className="flex h-[calc(100%-80px)]">
        <main className="relative flex flex-1">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <TabsComponent
              options={viewOptions}
              handleSelect={handleSelect}
              selectedId={playbook.view}
            />
          </div>
          {playbook.view === "step" ? (
            <div className="flex justify-center w-full absolute top-14 h-[calc(100%-3.5rem)]">
              <ListView />
            </div>
          ) : (
            <Builder isLog={isPrefetched || executionId} />
          )}
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
        {playbook.view === "builder" && <PermenantDrawer />}
      </div>
      {/* <ConditionDrawer /> */}
    </div>
  );
}

export default CreatePlaybook;
