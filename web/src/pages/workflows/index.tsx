/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import Heading from "../../components/Heading.tsx";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader.tsx";
import TableSkeleton from "../../components/Skeleton/TableLoader.tsx";
import { useGetWorkflowsQuery } from "../../store/features/workflow/api/getWorkflowsApi.ts";
import CustomButton from "../../components/common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import usePaginationComponent from "../../hooks/common/usePaginationComponent";
import PaginatedTable from "../../components/common/Table/PaginatedTable.tsx";
import { useWorkflowsData } from "../../hooks/pages";
import WorkflowActionOverlay from "../../components/Workflows/WorkflowActionOverlay.tsx";
import { workflowColumns } from "../../utils/playbook/pages/workflowColumns.ts";

const Workflows = () => {
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useGetWorkflowsQuery();
  usePaginationComponent(refetch);
  const workflowsList = data?.workflows;
  const total = data?.meta?.total_count;
  const { rows, actions, isActionOpen, toggle, selectedWorkflow } =
    useWorkflowsData(workflowsList ?? [], refetch);

  const handleCreateWorkflow = () => {
    navigate({
      pathname: "/workflows/create",
    });
  };

  return (
    <div>
      <Heading heading={"Workflows"} />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center justify-between">
          <CustomButton onClick={handleCreateWorkflow}>
            <Add fontSize="small" /> Create Workflow
          </CustomButton>
        </div>
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <PaginatedTable
            columns={workflowColumns}
            data={rows}
            actions={actions}
            total={total}
          />
        </SuspenseLoader>
      </main>
      <WorkflowActionOverlay
        workflow={selectedWorkflow}
        isOpen={isActionOpen}
        toggleOverlay={toggle}
        refreshTable={refetch}
      />
    </div>
  );
};

export default Workflows;
