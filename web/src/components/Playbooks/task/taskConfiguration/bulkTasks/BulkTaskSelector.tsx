import useCurrentTask from "../../../../../hooks/playbooks/task/useCurrentTask";
import useIsPrefetched from "../../../../../hooks/playbooks/useIsPrefetched";
import { updateCardById } from "../../../../../utils/execution/updateCardById";
import Checkbox from "../../../../common/Checkbox";
import ExecutionVarFieldSelection from "./ExecutionVarFieldSelection";

const key = "is_bulk_execution";

type BulkTaskSelectorProps = {
  id: string;
};

function BulkTaskSelector({ id }: BulkTaskSelectorProps) {
  const [task] = useCurrentTask(id);
  const isChecked = task?.execution_configuration?.[key];
  const isPrefetched = useIsPrefetched();

  const handleChange = () => {
    updateCardById(`execution_configuration.${key}`, !isChecked, id);
  };

  return (
    <div>
      <Checkbox
        id="is_bulk_execution"
        isChecked={isChecked ?? false}
        label="Run multiple times"
        onChange={handleChange}
        isSmall={true}
        disabled={!!isPrefetched}
      />
      {isChecked && <ExecutionVarFieldSelection id={id} />}
    </div>
  );
}

export default BulkTaskSelector;
