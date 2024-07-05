/* eslint-disable react-hooks/exhaustive-deps */
import Heading from "../../Heading.js";
import SuspenseLoader from "../../Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../Skeleton/TableLoader.js";
import ExecutionsTable from "./ExecutionsTable.jsx";
import Search from "../../common/Search/index.tsx";
import useSearch from "../../../hooks/useSearch.ts";
import PaginatedTable from "../../PaginatedTable.tsx";

const context = "PLAYBOOK_EXECUTION";

const PlaybookExecutionsList = () => {
  const { data, isFetching } = useSearch(context);

  const playbooksList = data?.[context.toLowerCase()] ?? [];
  const total = data?.meta?.total_count;

  return (
    <div>
      <Heading
        heading={"Playbook Executions"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />

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
