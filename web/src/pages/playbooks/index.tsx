import { useNavigate } from "react-router-dom";
import { useGetPlaybooksQuery } from "../../store/features/playbook/api";
import usePaginationComponent from "../../hooks/common/usePaginationComponent";
import CustomButton from "../../components/common/CustomButton";
import { Add } from "@mui/icons-material";
import Heading from "../../components/Heading";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader";
import TableSkeleton from "../../components/Skeleton/TableLoader";
import PaginatedTable from "../../components/common/Table/PaginatedTable";
import useToggle from "../../hooks/common/useToggle";
import PlaybookActionOverlay from "../../components/Playbooks/PlaybookActionOverlay";
import { playbookColumns } from "../../utils/playbook/pages";
import Loading from "../../components/common/Loading";
import { usePlaybooksData } from "../../hooks/pages/playbooks";

const Playbooks = () => {
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useGetPlaybooksQuery();
  const playbookList = data?.playbooks;
  const total = data?.meta?.total_count;
  const { rows, actions, selectedPlaybook, copyLoading, isActionOpen, toggle } =
    usePlaybooksData(playbookList ?? []);
  usePaginationComponent(refetch);

  const handleCreatePlaybook = () => {
    navigate({
      pathname: "/playbooks/create",
    });
  };

  if (copyLoading) {
    return <Loading title="Copying your playbook..." />;
  }

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
            columns={playbookColumns}
            data={rows}
            actions={actions}
            total={total}
          />
        </SuspenseLoader>
      </main>
      <PlaybookActionOverlay
        playbook={selectedPlaybook}
        isOpen={isActionOpen}
        toggleOverlay={toggle}
        refreshTable={refetch}
      />
    </div>
  );
};

export default Playbooks;
