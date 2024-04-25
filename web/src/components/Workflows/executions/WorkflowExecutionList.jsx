/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import Heading from "../../Heading.js";
import { useEffect, useState } from "react";
import SuspenseLoader from "../../Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../Skeleton/TableLoader.js";
import ExecutionsTable from "./ExecutionsTable.jsx";
import { useGetWorkflowExecutionsQuery } from "../../../store/features/workflow/api/getWorkflowExecutionsApi.ts";

const WorkflowExecutionList = () => {
  const navigate = useNavigate();
  const [pageMeta, setPageMeta] = useState({ limit: 10, offset: 0 });
  const { data, isFetching, refetch } = useGetWorkflowExecutionsQuery({
    ...pageMeta,
  });
  const workflowsList = data?.workflow_executions;
  const total = data?.meta?.total_count;

  useEffect(() => {
    if (!isFetching) refetch(pageMeta);
  }, [pageMeta]);

  const pageUpdateCb = (page) => {
    setPageMeta(page);
  };

  const handleCreateWorkflow = () => {
    navigate({
      pathname: "/workflows/create",
    });
  };

  return (
    <div>
      <Heading
        heading={"Workflow Executions"}
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
          onClick={handleCreateWorkflow}
          style={{ color: "white", marginTop: "0px", marginRight: "10px" }}>
          + Create Workflow
        </button>
      </div>
      <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
        <ExecutionsTable
          workflowsList={workflowsList}
          total={total}
          pageSize={pageMeta ? pageMeta?.limit : 10}
          pageUpdateCb={pageUpdateCb}
          tableContainerStyles={
            workflowsList?.length
              ? {}
              : { maxHeight: "35vh", minHeight: "35vh" }
          }
          refreshTable={refetch}></ExecutionsTable>
      </SuspenseLoader>
    </div>
  );
};

export default WorkflowExecutionList;
