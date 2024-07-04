/* eslint-disable react-hooks/exhaustive-deps */
import Heading from "../../Heading.js";
import { useEffect, useState } from "react";
import SuspenseLoader from "../../Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../Skeleton/TableLoader.js";
import ExecutionsTable from "./ExecutionsTable.jsx";
import { useGetPlaybookExecutionsQuery } from "../../../store/features/playbook/api/getPlaybookExecutionsApi.ts";
import Search from "../../common/Search/index.tsx";

const PlaybookExecutionsList = () => {
  const [pageMeta, setPageMeta] = useState({ limit: 10, offset: 0 });
  const { data, isFetching, refetch } = useGetPlaybookExecutionsQuery({
    ...pageMeta,
  });
  const playbooksList = data?.playbook_executions;
  const total = data?.meta?.total_count;

  useEffect(() => {
    if (!isFetching) refetch(pageMeta);
  }, [pageMeta]);

  const pageUpdateCb = (page) => {
    setPageMeta(page);
  };

  const searchOptions = playbooksList?.map((e) => ({
    id: e.id,
    label: e.playbook_run_id,
  }));

  return (
    <div>
      <Heading
        heading={"Playbook Executions"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />

      <main className="flex flex-col gap-4 p-2 pt-4">
        <Search options={searchOptions} context="PLAYBOOK_EXECUTION" />
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
