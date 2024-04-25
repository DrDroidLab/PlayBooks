/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from "react-router-dom";
import Heading from "../../Heading";
import { useEffect, useState } from "react";
import SuspenseLoader from "../../Skeleton/SuspenseLoader";
import TableSkeleton from "../../Skeleton/TableLoader";
import ExecutionsTable from "./ExecutionsTable.jsx";
import { useLazyGetWorkflowQuery } from "../../../store/features/workflow/api/getWorkflowApi.ts";
import Loading from "../../common/Loading/index.tsx";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { useGetWorkflowExecutionsQuery } from "../../../store/features/workflow/api/getWorkflowExecutionsApi.ts";
import { ChevronLeft } from "@mui/icons-material";

const WorkflowExecutions = () => {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();
  const [pageMeta, setPageMeta] = useState({ limit: 10, offset: 0 });
  const { data, isFetching, refetch } = useGetWorkflowExecutionsQuery({
    ...pageMeta,
    workflowId,
  });
  const [triggerGetWorkflow, { isLoading: workflowLoading }] =
    useLazyGetWorkflowQuery();
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const workflowsList = data?.workflows;
  const total = data?.meta?.total_count;

  useEffect(() => {
    if (!isFetching) refetch(pageMeta);
  }, [pageMeta]);

  const pageUpdateCb = (page) => {
    setPageMeta(page);
  };

  useEffect(() => {
    if (workflowId != null) {
      triggerGetWorkflow(workflowId);
    }
  }, [workflowId]);

  if (workflowLoading) {
    return <Loading title="Your workflow is loading..." />;
  }

  return (
    <div>
      <Heading
        heading={"Workflow Executions-" + currentWorkflow.name}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />
      <button
        onClick={() => navigate(-1)}
        className="p-1 text-sm border border-violet-500 rounded m-2 text-violet-500 flex items-center cursor-pointer hover:text-white hover:bg-violet-500 transition-all">
        <ChevronLeft /> All Workflows
      </button>
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

export default WorkflowExecutions;
