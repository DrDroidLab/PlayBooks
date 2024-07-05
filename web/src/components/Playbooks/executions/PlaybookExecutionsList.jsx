/* eslint-disable react-hooks/exhaustive-deps */
import Heading from "../../Heading.js";
import { useState } from "react";
import SuspenseLoader from "../../Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../Skeleton/TableLoader.js";
import ExecutionsTable from "./ExecutionsTable.jsx";
import Search from "../../common/Search/index.tsx";
import useSearch from "../../../hooks/useSearch.ts";

const context = "PLAYBOOK_EXECUTION";

const PlaybookExecutionsList = () => {
  const [pageMeta, setPageMeta] = useState({ limit: 10, offset: 0 });
  const options = {
    context,
    ...pageMeta,
  };
  const { data, isFetching, refetch } = useSearch(options);

  const playbooksList = data?.[context.toLowerCase()] ?? [];
  const total = data?.meta?.total_count;

  const pageUpdateCb = (page) => {
    setPageMeta(page);
  };

  return (
    <div>
      <Heading
        heading={"Playbook Executions"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />

      <main className="flex flex-col gap-4 p-2 pt-4">
        <Search
          context={context}
          limit={pageMeta.limit}
          offset={pageMeta.offset}
        />
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <ExecutionsTable
            playbooksList={playbooksList}
            total={total}
            pageSize={pageMeta ? pageMeta?.limit : 10}
            pageUpdateCb={pageUpdateCb}
            tableContainerStyles={
              playbooksList?.length
                ? {}
                : { maxHeight: "35vh", minHeight: "35vh" }
            }
            refreshTable={refetch}></ExecutionsTable>
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default PlaybookExecutionsList;
