/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from "react-router-dom";
import Heading from "../../components/Heading.tsx";
import { useEffect } from "react";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader.tsx";
import TableSkeleton from "../../components/Skeleton/TableLoader.tsx";
import { useLazyGetWorkflowQuery } from "../../store/features/workflow/api/getWorkflowApi.ts";
import Loading from "../../components/common/Loading/index.tsx";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../store/features/workflow/workflowSlice.ts";
import { useGetWorkflowExecutionsQuery } from "../../store/features/workflow/api/getWorkflowExecutionsApi.ts";
import { ChevronLeft } from "@mui/icons-material";
import usePaginationComponent from "../../hooks/common/usePaginationComponent";
import PaginatedTable from "../../components/common/Table/PaginatedTable.tsx";
import { workflowExecutionColumns } from "../../utils/workflow/pages/workflowExecutions.ts";
import { useWorkflowExecutionsListData } from "../../hooks/pages/index.ts";

const WorkflowExecutions = () => {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useGetWorkflowExecutionsQuery({
    workflowId: workflowId ?? "",
  });
  usePaginationComponent(refetch);
  const [triggerGetWorkflow, { isLoading: workflowLoading }] =
    useLazyGetWorkflowQuery();
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const workflowsList = data?.workflow_executions;
  const total = data?.meta?.total_count;
  const { rows, actions } = useWorkflowExecutionsListData(workflowsList ?? []);

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
      <Heading heading={"Workflow Executions-" + currentWorkflow.name} />
      <main className="p-2">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-sm border border-violet-500 rounded my-2 text-violet-500 flex items-center cursor-pointer hover:text-white hover:bg-violet-500 transition-all">
          <ChevronLeft /> All Workflows
        </button>
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <PaginatedTable
            columns={workflowExecutionColumns}
            data={rows}
            actions={actions}
            total={total}
          />
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default WorkflowExecutions;
