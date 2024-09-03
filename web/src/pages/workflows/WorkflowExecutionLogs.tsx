/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from "react-router-dom";
import Heading from "../../components/Heading.js";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../components/Skeleton/TableLoader.js";
import { ChevronLeft } from "@mui/icons-material";
import { useGetWorkflowExecutionLogsQuery } from "../../store/features/workflow/api/getWorkflowExecutionLogsApi.ts";
import usePaginationComponent from "../../hooks/common/usePaginationComponent.ts";
import PaginatedTable from "../../components/common/Table/PaginatedTable.tsx";
import { usePlaybookExecutionsData } from "../../hooks/pages/index.ts";
import { playbookExecutionColumns } from "../../utils/playbook/pages";
import { Column } from "../../components/common/Table/types/Column.ts";

const WorkflowExecutionLogs = () => {
  const { workflow_run_id: workflowRunId } = useParams();
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useGetWorkflowExecutionLogsQuery({
    workflowRunId: workflowRunId ?? "",
  });
  usePaginationComponent(refetch);
  const playbooksList = data?.workflow_execution_logs ?? [];
  const total = data?.meta?.total_count ?? 0;
  const list =
    playbooksList?.map((e) => ({
      ...e.playbook_execution,
      finished_at: e.finished_at,
      scheduled_at: e.scheduled_at,
      created_at: e.created_at,
      created_by: e.created_by,
    })) ?? [];
  const { rows } = usePlaybookExecutionsData(list ?? []);

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
          <PaginatedTable
            columns={playbookExecutionColumns as Column<any>[]}
            data={rows}
            actions={[]}
            total={total}
          />
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default WorkflowExecutionLogs;
