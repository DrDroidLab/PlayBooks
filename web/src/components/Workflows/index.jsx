/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import Heading from "../Heading";
import { useEffect, useState } from "react";
import SuspenseLoader from "../Skeleton/SuspenseLoader";
import TableSkeleton from "../Skeleton/TableLoader";
import PlaybookTable from "./WorkflowTable.jsx";
import { useGetPlaybooksQuery } from "../../store/features/playbook/api/index.ts";

const Workflows = () => {
  const navigate = useNavigate();
  const [pageMeta, setPageMeta] = useState({ limit: 10, offset: 0 });
  const { data, isFetching, refetch } = useGetPlaybooksQuery(pageMeta);
  const playbookList = data?.playbooks;
  const total = data?.meta?.total_count;

  useEffect(() => {
    if (!isFetching) refetch(pageMeta);
  }, [pageMeta]);

  const pageUpdateCb = (page) => {
    setPageMeta(page);
  };

  const handleCreatePlaybook = () => {
    navigate({
      pathname: "/workflows/create",
    });
  };

  return (
    <div>
      <Heading
        heading={"Workflows"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "1.5rem",
          justifyContent: "space-between",
        }}>
        <button
          className="text-sm bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg create_playbook"
          onClick={handleCreatePlaybook}
          style={{ color: "white", marginTop: "0px", marginRight: "10px" }}>
          + Create Workflow
        </button>
      </div>
      <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
        <PlaybookTable
          playbookList={playbookList}
          total={total}
          pageSize={pageMeta ? pageMeta?.limit : 10}
          pageUpdateCb={pageUpdateCb}
          tableContainerStyles={
            playbookList?.length ? {} : { maxHeight: "35vh", minHeight: "35vh" }
          }
          refreshTable={refetch}></PlaybookTable>
      </SuspenseLoader>
    </div>
  );
};

export default Workflows;
