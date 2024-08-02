/* eslint-disable react-hooks/exhaustive-deps */
import Heading from "../../Heading.js";
import SuspenseLoader from "../../Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../Skeleton/TableLoader.js";
import ExecutionsTable from "./ExecutionsTable.js";
import Search from "../../common/Search/index.tsx";
import PaginatedTable from "../../PaginatedTable.tsx";
import useSearch from "../../../hooks/common/useSearch.ts";
import usePaginationComponent from "../../../hooks/common/usePaginationComponent.ts";

const context = "PLAYBOOK_EXECUTION";

const PlaybookExecutionsList = () => {
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

export default PlaybookExecutionsList;
