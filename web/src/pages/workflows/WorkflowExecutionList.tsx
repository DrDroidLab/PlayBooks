/* eslint-disable react-hooks/exhaustive-deps */
import Heading from "../../components/Heading.js";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../components/Skeleton/TableLoader.js";
import Search from "../../components/common/Search/index.tsx";
import PaginatedTable from "../../components/common/Table/PaginatedTable.tsx";
import usePaginationComponent from "../../hooks/common/usePaginationComponent";
import useSearch from "../../hooks/common/useSearch";
import { useWorkflowExecutionsListData } from "../../hooks/pages/index.ts";
import { workflowExecutionColumns } from "../../utils/workflow/pages/workflowExecutions.ts";

const context = "WORKFLOW_EXECUTION";

const WorkflowExecutionList = () => {
  const { data, isFetching, refetch } = useSearch(context);
  usePaginationComponent(refetch);
  const workflowsList = data?.[context.toLowerCase()];
  const total = data?.meta?.total_count;
  const { rows, actions } = useWorkflowExecutionsListData(workflowsList ?? []);

  return (
    <div>
      <Heading heading={"Workflow Executions"} />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <Search context={context} />
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

export default WorkflowExecutionList;
