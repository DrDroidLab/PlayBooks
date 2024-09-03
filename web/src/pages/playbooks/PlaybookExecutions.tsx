import Search from "../../components/common/Search";
import PaginatedTable from "../../components/common/Table/PaginatedTable";
import { Column } from "../../components/common/Table/types";
import Heading from "../../components/Heading";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader";
import TableSkeleton from "../../components/Skeleton/TableLoader";
import usePaginationComponent from "../../hooks/common/usePaginationComponent";
import useSearch from "../../hooks/common/useSearch";
import { usePlaybookExecutionsData } from "../../hooks/pages";
import { playbookExecutionColumns } from "../../utils/playbook/pages";

const context = "PLAYBOOK_EXECUTION";

const PlaybookExecutions = () => {
  const { data, isFetching, refetch } = useSearch(context);
  const playbooksList = data?.[context.toLowerCase()] ?? [];
  const total = data?.meta?.total_count;
  const { rows } = usePlaybookExecutionsData(playbooksList ?? []);
  usePaginationComponent(refetch);

  return (
    <div>
      <Heading heading={"Playbook Executions"} />

      <main className="flex flex-col gap-4 p-2 pt-4">
        <Search context={context} />
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <PaginatedTable
            columns={playbookExecutionColumns as Column<any>[]}
            data={rows}
            total={total}
            actions={[]}
          />
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default PlaybookExecutions;
