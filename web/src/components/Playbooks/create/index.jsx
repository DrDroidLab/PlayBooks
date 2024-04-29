import React, { useEffect, useRef, useState } from "react";
import CreateFlow from "./CreateFlow";
import Sidebar from "./Sidebar";
import Heading from "../../Heading";
import StepDetails from "./StepDetails";
import CustomDrawer from "../../common/CustomDrawer";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  resetState,
  setPlaybookDataBeta,
  setCurrentStepIndex,
  copyPlaybook,
} from "../../../store/features/playbook/playbookSlice.ts";
import {
  resetTimeRange,
  setPlaybookState,
} from "../../../store/features/timeRange/timeRangeSlice.ts";
import GlobalVariables from "../../common/GlobalVariable/index.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useLazyGetPlaybookQuery } from "../../../store/features/playbook/api/getPlaybookApi.ts";
import Loading from "../../common/Loading/index.tsx";

function CreatePlaybookBeta() {
  const navigate = useNavigate();
  const { playbook_id: id } = useParams();
  const [addDataDrawerOpen, setAddDataDrawerOpen] = useState(false);
  const { currentStepIndex } = useSelector(playbookSelector);
  const dispatch = useDispatch();
  const copied = useRef(false);
  const playbookDataRef = useRef(null);

  useEffect(() => {
    dispatch(setPlaybookState());
    return () => {
      if (!copied.current) dispatch(resetState());
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
    const res = playbookDataRef.current;
    dispatch(copyPlaybook(res));
    copied.current = true;
    navigate("/playbooks/create", {
      replace: true,
    });
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

  return (
    <div className="h-screen overflow-hidden">
      <Heading
        heading={"Playbook Builder"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
        customTimeRange={true}
        copyPlaybook={handleCopyPlaybook}
      />
      <main className="relative flex h-[calc(100%-80px)]">
        <button
          onClick={() => setAddDataDrawerOpen(true)}
          className="absolute top-2 left-2 border border-violet-500 text-violet-500 p-1 rounded transition-all hover:text-white hover:bg-violet-500 text-sm z-10">
          Add Data
        </button>
        <div className="absolute top-14 left-2 z-10 bg-white p-1 rounded w-48">
          <GlobalVariables />
        </div>
        <CustomDrawer
          isOpen={addDataDrawerOpen}
          setIsOpen={setAddDataDrawerOpen}
          openFrom="left"
          addtionalStyles={"lg:w-[20%]"}
          showOverlay={false}
          startFrom="80">
          <div className="flex-[0.4] border-r-[1px] border-r-gray-200 h-full">
            <Sidebar setIsOpen={setAddDataDrawerOpen} />
          </div>
        </CustomDrawer>
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

export default CreatePlaybookBeta;
