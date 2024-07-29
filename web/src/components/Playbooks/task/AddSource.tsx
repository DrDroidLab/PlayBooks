import { unsupportedConnctorTypeOptions } from "../../../utils/playbook/unsupportedConnctorTypeOptions.ts";
import SelectSource from "./source/SelectSource.tsx";
import SelectTaskType from "./source/SelectTaskType.tsx";
import SelectConnectorOption from "./source/SelectConnectorOption.tsx";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";

function AddSource({ id }) {
  const [task, currentTaskId] = useCurrentTask(id);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex mt-2 gap-2">
        <div className="flex items-center gap-2">
          <SelectSource id={currentTaskId} />
          <SelectTaskType id={currentTaskId} />
        </div>
      </div>
      {!unsupportedConnctorTypeOptions.includes(task?.type ?? "") && (
        <div className="flex gap-2 items-center">
          <SelectConnectorOption id={currentTaskId} />
        </div>
      )}
    </div>
  );
}

export default AddSource;
