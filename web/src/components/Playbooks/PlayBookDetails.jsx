import { useParams } from "react-router-dom";
import SuspenseLoader from "../Skeleton/SuspenseLoader";
import TableSkeleton from "../Skeleton/TableLoader";
import CreatePlaybook from "./CreatePlaybook";
import { useGetPlaybookQuery } from "../../store/features/playbook/api/index.ts";

const PlayBookDetails = () => {
  const { playbook_id } = useParams();
  const { data, isLoading } = useGetPlaybookQuery({
    playbookId: parseInt(playbook_id),
  });

  return (
    <div>
      <SuspenseLoader loading={isLoading} loader={<TableSkeleton />}>
        <CreatePlaybook playbook={data} allowSave={false} />
      </SuspenseLoader>
    </div>
  );
};

export default PlayBookDetails;
