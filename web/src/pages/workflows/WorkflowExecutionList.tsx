/* eslint-disable react-hooks/exhaustive-deps */
import Heading from "../../components/Heading.js";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../components/Skeleton/TableLoader.js";
import ExecutionsTable from "../../components/Workflows/executions/ExecutionsTable.jsx";
import Search from "../../components/common/Search/index.tsx";
import useSearch from "../../hooks/useSearch.ts";
import PaginatedTable from "../../components/PaginatedTable.tsx";
import usePaginationComponent from "../../hooks/usePaginationComponent.ts";

const context = "WORKFLOW_EXECUTION";

const WorkflowExecutionList = () => {
  const { data, isFetching, refetch } = useSearch(context);
  usePaginationComponent(refetch);
  const workflowsList = data?.[context.toLowerCase()];
  const total = data?.meta?.total_count;

  return (
    <div>
      <Heading heading={"Workflow Executions"} />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <Search context={context} />
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <PaginatedTable
            renderTable={ExecutionsTable}
            data={workflowsList ?? []}
            total={total}
            tableContainerStyles={
              workflowsList?.length
                ? {}
                : { maxHeight: "35vh", minHeight: "35vh" }
            }
          />
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default WorkflowExecutionList;
