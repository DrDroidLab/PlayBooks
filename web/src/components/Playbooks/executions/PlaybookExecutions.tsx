/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from "react-router-dom";
import Heading from "../../Heading.js";
import { useEffect } from "react";
import SuspenseLoader from "../../Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../Skeleton/TableLoader.js";
import ExecutionsTable from "./ExecutionsTable.js";
import Loading from "../../common/Loading/index.tsx";
import { useSelector } from "react-redux";
import { ChevronLeft } from "@mui/icons-material";
import { useGetPlaybookExecutionsQuery } from "../../../store/features/playbook/api/getPlaybookExecutionsApi.ts";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useLazyGetPlaybookQuery } from "../../../store/features/playbook/api/getPlaybookApi.ts";
import PaginatedTable from "../../PaginatedTable.tsx";
import usePaginationComponent from "../../../hooks/common/usePaginationComponent.ts";

const PlaybookExecutions = () => {
  const { id: playbookId } = useParams();
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useGetPlaybookExecutionsQuery({
    playbookId: playbookId ?? "",
  });
  const [triggerGetPlaybook, { isLoading: workflowLoading }] =
    useLazyGetPlaybookQuery();
  const { currentPlaybook } = useSelector(playbookSelector);
  const playbooksList = data?.playbook_executions;
  const total = data?.meta?.total_count;
  usePaginationComponent(refetch);

  useEffect(() => {
    if (playbookId != null) {
      triggerGetPlaybook({ playbookId });
    }
  }, [playbookId]);

  if (workflowLoading) {
    return <Loading title="Your playbook executions is loading..." />;
  }

  return (
    <div>
      <Heading heading={"Playbook Executions-" + currentPlaybook?.name} />
      <button
        onClick={() => navigate(-1)}
        className="p-1 text-sm border border-violet-500 rounded m-2 text-violet-500 flex items-center cursor-pointer hover:text-white hover:bg-violet-500 transition-all">
        <ChevronLeft /> All Playbooks
      </button>
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
    </div>
  );
};

export default PlaybookExecutions;
