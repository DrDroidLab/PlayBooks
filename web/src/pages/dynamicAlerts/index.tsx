import { AddRounded } from "@mui/icons-material";
import CustomButton from "../../components/common/CustomButton";
import Heading from "../../components/Heading";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader";
import TableSkeleton from "../../components/Skeleton/TableLoader";
import { useNavigate } from "react-router-dom";
import { routes } from "../../routes";
import { useSearchQuery } from "../../store/features/search/api/searchApi";
import { selectedQuery } from "../../utils/dynamicAlerts/selectedQuery";
import { useEffect } from "react";
import { useDynamicAlertsData } from "../../hooks/pages";
import { dynamicAlertColumns } from "../../utils/dynamicAlerts/pages";
import { Column } from "../../components/common/Table/types";
import PaginatedTable from "../../components/common/Table/PaginatedTable";
import ActionOverlay from "../../components/DynamicAlerts/Table/ActionOverlay";

const context = "WORKFLOW";

function DynamicAlerts() {
  const navigate = useNavigate();
  const { data, refetch, isUninitialized } = useSearchQuery({
    context,
    selected: selectedQuery,
  });
  const { rows, actions, isActionOpen, toggle, item } = useDynamicAlertsData(
    data?.workflow ?? [],
  );

  const handleCreateDynamicAlert = () => {
    navigate(routes.CREATE_DYNAMIC_ALERTS);
  };

  useEffect(() => {
    if (!isUninitialized) {
      refetch();
    }
  }, [isUninitialized]);

  return (
    <div>
      <Heading heading="Dynamic Alerts" />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center gap-2">
          <CustomButton onClick={handleCreateDynamicAlert}>
            <AddRounded fontSize="small" /> Create Dynamic Alert
          </CustomButton>
        </div>
        <SuspenseLoader loading={false} loader={<TableSkeleton />}>
          <PaginatedTable
            columns={dynamicAlertColumns as Column<any>[]}
            data={rows}
            actions={actions}
            total={data?.workflow?.length ?? 0}
          />
        </SuspenseLoader>
      </main>
      <ActionOverlay isOpen={isActionOpen} toggleOverlay={toggle} item={item} />
    </div>
  );
}

export default DynamicAlerts;
