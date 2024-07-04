/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import Heading from "../Heading";
import { useEffect, useState } from "react";
import SuspenseLoader from "../Skeleton/SuspenseLoader";
import TableSkeleton from "../Skeleton/TableLoader";
import { useGetWorkflowsQuery } from "../../store/features/workflow/api/getWorkflowsApi.ts";
import WorkflowTable from "./WorkflowTable.jsx";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";

const Workflows = () => {
  const navigate = useNavigate();
  const [pageMeta, setPageMeta] = useState({ limit: 10, offset: 0 });
  const { data, isFetching, refetch } = useGetWorkflowsQuery(pageMeta);
  const workflowsList = data?.workflows;
  const total = data?.meta?.total_count;

  useEffect(() => {
    if (!isFetching) refetch(pageMeta);
  }, [pageMeta]);

  const pageUpdateCb = (page) => {
    setPageMeta(page);
  };

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
          <WorkflowTable
            workflowsList={workflowsList}
            total={total}
            pageSize={pageMeta ? pageMeta?.limit : 10}
            pageUpdateCb={pageUpdateCb}
            tableContainerStyles={
              workflowsList?.length
                ? {}
                : { maxHeight: "35vh", minHeight: "35vh" }
            }
            refreshTable={refetch}></WorkflowTable>
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default Workflows;
