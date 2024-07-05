/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import Heading from "../Heading";
import { useEffect, useState } from "react";
import SuspenseLoader from "../Skeleton/SuspenseLoader";
import TableSkeleton from "../Skeleton/TableLoader";
import { useGetPlaybooksQuery } from "../../store/features/playbook/api/index.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import PaginatedTable from "../PaginatedTable.tsx";
import PlaybookTable from "./PlayBookTable.jsx";

const Playbooks = () => {
  const navigate = useNavigate();
  const [pageMeta, setPageMeta] = useState({ limit: 10, offset: 0 });
  const { data, isFetching, refetch } = useGetPlaybooksQuery(pageMeta);
  const playbookList = data?.playbooks;
  const total = data?.meta?.total_count;

  useEffect(() => {
    if (!isFetching) refetch(pageMeta);
  }, [pageMeta]);

  const pageUpdateCb = (page) => {
    setPageMeta(page);
  };

  const handleCreatePlaybook = () => {
    navigate({
      pathname: "/playbooks/create",
    });
  };

  return (
    <div>
      <Heading
        heading={"Playbooks"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center gap-2">
          <CustomButton onClick={handleCreatePlaybook}>
            <Add fontSize="small" /> Create Playbook
          </CustomButton>
        </div>
        <SuspenseLoader loading={isFetching} loader={<TableSkeleton />}>
          <PaginatedTable
            renderTable={PlaybookTable}
            data={playbookList ?? []}
            total={total}
            pageUpdateCb={pageUpdateCb}
            tableContainerStyles={
              playbookList?.length
                ? {}
                : { maxHeight: "35vh", minHeight: "35vh" }
            }
            refreshTable={refetch}
          />
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default Playbooks;
