import { AddRounded } from "@mui/icons-material";
import CustomButton from "../../components/common/CustomButton";
import Heading from "../../components/Heading";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader";
import PaginatedTable from "../../components/PaginatedTable";
import PlaybookTable from "../../components/Playbooks/PlayBookTable";
import TableSkeleton from "../../components/Skeleton/TableLoader";
import { useNavigate } from "react-router-dom";
import { routes } from "../../routes";

function DynamicAlerts() {
  const navigate = useNavigate();

  const handleCreateDynamicAlert = () => {
    navigate(routes.DYNAMIC_ALERTS);
  };

  return (
    <div>
      <Heading heading="Playbooks" />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center gap-2">
          <CustomButton onClick={handleCreateDynamicAlert}>
            <AddRounded fontSize="small" /> Create Dynamic Alert
          </CustomButton>
        </div>
        <SuspenseLoader loading={false} loader={<TableSkeleton />}>
          <PaginatedTable renderTable={PlaybookTable} data={[]} total={0} />
        </SuspenseLoader>
      </main>
    </div>
  );
}

export default DynamicAlerts;
