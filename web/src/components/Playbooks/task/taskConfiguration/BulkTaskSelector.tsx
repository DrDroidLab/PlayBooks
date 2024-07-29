import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask";
import { updateCardById } from "../../../../utils/execution/updateCardById";
import Checkbox from "../../../common/Checkbox";
import ExecutionVarFieldSelection from "./ExecutionVarFieldSelection";

const key = "is_bulk_execution";

type BulkTaskSelectorProps = {
  id: string;
};

function BulkTaskSelector({ id }: BulkTaskSelectorProps) {
  const [task] = useCurrentTask(id);
  const isChecked = task?.execution_configuration?.[key];

  const handleChange = () => {
    updateCardById(`execution_configuration.${key}`, !isChecked, id);
  };

  return (
    <div className="mt-2">
      <Checkbox
        id="is_bulk_execution"
        isChecked={isChecked}
        label="Is Bulk Execution"
        onChange={handleChange}
        isSmall={true}
      />
      {isChecked && <ExecutionVarFieldSelection />}
    </div>
  );
}

export default BulkTaskSelector;
