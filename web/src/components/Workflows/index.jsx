/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import Heading from "../Heading";
import SuspenseLoader from "../Skeleton/SuspenseLoader";
import TableSkeleton from "../Skeleton/TableLoader";
import { useGetWorkflowsQuery } from "../../store/features/workflow/api/getWorkflowsApi.ts";
import WorkflowTable from "./WorkflowTable.jsx";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import PaginatedTable from "../PaginatedTable.tsx";
import usePaginationComponent from "../../hooks/usePaginationComponent.ts";

const Workflows = () => {
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useGetWorkflowsQuery();
  usePaginationComponent(refetch);
  const workflowsList = data?.workflows;
  const total = data?.meta?.total_count;

  const handleCreateWorkflow = () => {
    navigate({
      pathname: "/workflows/create",
    });
  };

  return (
    <div>
      <Heading
        heading={"Workflows"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center justify-between">
          <CustomButton onClick={handleCreateWorkflow}>
            <Add fontSize="small" /> Create Workflow
          </CustomButton>
        </div>
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <PaginatedTable
            renderTable={WorkflowTable}
            data={workflowsList ?? []}
            total={total}
            tableContainerStyles={
              workflowsList?.length
                ? {}
                : { maxHeight: "35vh", minHeight: "35vh" }
            }></PaginatedTable>
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default Workflows;
