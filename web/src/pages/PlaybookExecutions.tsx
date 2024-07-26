import Search from "../components/common/Search";
import Heading from "../components/Heading";
import PaginatedTable from "../components/PaginatedTable";
import ExecutionsTable from "../components/Playbooks/executions/ExecutionsTable";
import SuspenseLoader from "../components/Skeleton/SuspenseLoader";
import TableSkeleton from "../components/Skeleton/TableLoader";
import usePaginationComponent from "../hooks/usePaginationComponent";
import useSearch from "../hooks/useSearch";

const context = "PLAYBOOK_EXECUTION";

const PlaybookExecutions = () => {
  const { data, isFetching, refetch } = useSearch(context);
  usePaginationComponent(refetch);

  const playbooksList = data?.[context.toLowerCase()] ?? [];
  const total = data?.meta?.total_count;

  return (
    <div>
      <Heading heading={"Playbook Executions"} />

      <main className="flex flex-col gap-4 p-2 pt-4">
        <Search context={context} />
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <PaginatedTable
            renderTable={ExecutionsTable}
            data={playbooksList ?? []}
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

export default PlaybookExecutions;
