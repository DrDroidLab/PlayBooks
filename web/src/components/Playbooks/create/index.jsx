import React, { useEffect, useRef, useState } from "react";
import Heading from "../../Heading";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  resetState,
  setPlaybookDataBeta,
  copyPlaybook,
  setView,
  setPlaybookKey,
} from "../../../store/features/playbook/playbookSlice.ts";
import {
  resetTimeRange,
  setPlaybookState,
} from "../../../store/features/timeRange/timeRangeSlice.ts";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLazyGetPlaybookQuery } from "../../../store/features/playbook/api/getPlaybookApi.ts";
import Loading from "../../common/Loading/index.tsx";
import ListView from "../ListView.jsx";
import Builder from "./Builder.jsx";
import TabsComponent from "../../common/TabsComponent/index.tsx";
import { COPY_LOADING_DELAY } from "../../../constants/index.ts";
import CustomButton from "../../common/CustomButton/index.tsx";
import CustomDrawer from "../../common/CustomDrawer/index.jsx";
import Timeline from "../Timeline.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

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
  const navigate = useNavigate();
  const { playbook_id: id } = useParams();
  const playbook = useSelector(playbookSelector);
  const dispatch = useDispatch();
  const copied = useRef(false);
  const playbookDataRef = useRef(null);
  const [copyLoading, setCopyLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const executionId = searchParams.get("executionId");
  const [timelineOpen, setTimelineOpen] = useState(false);
  const isPrefetched = useIsPrefetched();

  useEffect(() => {
    dispatch(setPlaybookKey({ key: "executionId", value: executionId }));
  }, [executionId, dispatch]);

  useEffect(() => {
    dispatch(setPlaybookState());
    return () => {
      dispatch(resetState());
      dispatch(resetTimeRange());
    };
  }, [dispatch]);

  const [triggerGetPlaybook, { isLoading }] = useLazyGetPlaybookQuery();

  const fetchPlaybook = async () => {
    const res = await triggerGetPlaybook({ playbookId: id }).unwrap();
    playbookDataRef.current = res;
    dispatch(setPlaybookDataBeta(res));
  };

  const handleCopyPlaybook = async () => {
    setCopyLoading(true);
    const res = playbookDataRef.current;
    dispatch(copyPlaybook(res));
    copied.current = true;
    setTimeout(() => {
      setCopyLoading(false);
      navigate("/playbooks/create", {
        replace: true,
      });
    }, COPY_LOADING_DELAY);
  };

  const handleSelect = (option) => {
    dispatch(setView(option.id));
  };

  useEffect(() => {
    if (id) {
      fetchPlaybook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return <Loading />;
  }

  if (copyLoading) {
    return <Loading title="Copying your playbook..." />;
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
        copyPlaybook={handleCopyPlaybook}
        showEditTitle={playbook}
        showRunAll={true}
      />
      <div className="flex flex-col h-[calc(100%-80px)]">
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
          <div className="absolute top-2 right-2 flex flex-col items-start gap-4 z-10">
            {executionId && (
              <CustomButton onClick={() => setTimelineOpen(true)}>
                View Timeline
              </CustomButton>
            )}
          </div>
        </main>
      </div>
      <CustomDrawer
        isOpen={timelineOpen}
        setIsOpen={setTimelineOpen}
        addtionalStyles={"lg:w-[50%]"}
        showOverlay={true}
        startFrom="80">
        {timelineOpen && (
          <div className="flex-[0.4] border-l-[1px] border-l-gray-200 h-full overflow-scroll">
            <Timeline setTimelineOpen={setTimelineOpen} />
          </div>
        )}
      </CustomDrawer>
    </div>
  );
}

export default CreatePlaybook;
