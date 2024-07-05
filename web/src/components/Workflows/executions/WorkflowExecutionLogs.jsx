/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from "react-router-dom";
import Heading from "../../Heading.js";
import SuspenseLoader from "../../Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../Skeleton/TableLoader.js";
import { ChevronLeft } from "@mui/icons-material";
import { useGetWorkflowExecutionLogsQuery } from "../../../store/features/workflow/api/getWorkflowExecutionLogsApi.ts";
import ExecutionsTable from "../../Playbooks/executions/ExecutionsTable.jsx";
import PaginatedTable from "../../PaginatedTable.tsx";

const WorkflowExecutionLogs = () => {
  const { workflow_run_id: workflowRunId } = useParams();
  const navigate = useNavigate();
  const { data, isFetching } = useGetWorkflowExecutionLogsQuery({
    workflowRunId,
  });

  const playbooksList =
    data?.workflow_executions?.length > 0
      ? data?.workflow_executions[0].workflow_logs
      : [];

  const execution =
    data?.workflow_executions?.length > 0 ? data?.workflow_executions[0] : null;

  const total = data?.meta?.total_count;

  return (
    <div>
      <Heading
        heading={workflowRunId + " Executions"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-sm border border-violet-500 rounded text-violet-500 flex items-center cursor-pointer hover:text-white hover:bg-violet-500 transition-all">
            <ChevronLeft /> All Workflows
          </button>
        </div>
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <PaginatedTable
            renderTable={ExecutionsTable}
            data={
              playbooksList?.map((e) => ({
                ...e.playbook_execution,
                finished_at: execution.finished_at,
                scheduled_at: execution.scheduled_at,
                created_at: execution.created_at,
                created_by: execution.created_by,
              })) ?? []
            }
            total={total}
            tableContainerStyles={
              playbooksList?.length
                ? {}
                : { maxHeight: "35vh", minHeight: "35vh" }
            }
          />
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default WorkflowExecutionLogs;
