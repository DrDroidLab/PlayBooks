import { useNavigate } from "react-router-dom";
import { useGetPlaybooksQuery } from "../../store/features/playbook/api";
import usePaginationComponent from "../../hooks/usePaginationComponent";
import CustomButton from "../../components/common/CustomButton";
import { Add } from "@mui/icons-material";
import Heading from "../../components/Heading";
import PaginatedTable from "../../components/PaginatedTable";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader";
import TableSkeleton from "../../components/Skeleton/TableLoader";
import PlaybookTable from "../../components/Playbooks/PlayBookTable";

const Playbooks = () => {
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useGetPlaybooksQuery();
  const playbookList = data?.playbooks;
  const total = data?.meta?.total_count;
  usePaginationComponent(refetch);

  const handleCreatePlaybook = () => {
    navigate({
      pathname: "/playbooks/create",
    });
  };

  return (
    <div>
      <Heading heading="Playbooks" />
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
            tableContainerStyles={
              playbookList?.length
                ? {}
                : { maxHeight: "35vh", minHeight: "35vh" }
            }
          />
        </SuspenseLoader>
      </main>
    </div>
  );
};

export default Playbooks;
