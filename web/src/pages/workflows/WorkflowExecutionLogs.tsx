/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from "react-router-dom";
import Heading from "../../components/Heading.js";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../components/Skeleton/TableLoader.js";
import { ChevronLeft } from "@mui/icons-material";
import { useGetWorkflowExecutionLogsQuery } from "../../store/features/workflow/api/getWorkflowExecutionLogsApi.ts";
import ExecutionsTable from "../../components/Playbooks/executions/ExecutionsTable.js";

const WorkflowExecutionLogs = () => {
  const { workflow_run_id: workflowRunId } = useParams();
  const navigate = useNavigate();
  const { data, isFetching } = useGetWorkflowExecutionLogsQuery({
    workflowRunId: workflowRunId ?? "",
  });

  const playbooksList =
    data?.workflow_executions?.length > 0
      ? data?.workflow_executions?.[0].workflow_logs
      : [];

  const execution =
    data?.workflow_executions?.length > 0
      ? data?.workflow_executions?.[0]
      : null;

  const total = data?.meta?.total_count ?? 0;

  return (
    <div>
      <Heading heading={workflowRunId + " Executions"} />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-sm border border-violet-500 rounded text-violet-500 flex items-center cursor-pointer hover:text-white hover:bg-violet-500 transition-all">
            <ChevronLeft /> All Workflows
          </button>
        </div>
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <ExecutionsTable
            data={
              playbooksList?.map((e) => ({
                ...e.playbook_execution,
                finished_at: execution.finished_at,
                scheduled_at: execution.scheduled_at,
                created_at: execution.created_at,
                created_by: execution.created_by,
              })) ?? []
            }
          />
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default WorkflowExecutionLogs;