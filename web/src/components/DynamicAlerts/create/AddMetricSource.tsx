import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask";
import { unsupportedConnctorTypeOptions } from "../../../utils/playbook/unsupportedConnctorTypeOptions";
import SelectConnectorOption from "../../Playbooks/task/source/SelectConnectorOption";
import SelectTaskType from "./SelectTaskType";

type AddMetricSourcePropTypes = {
  id: string;
};

function AddMetricSource({ id }: AddMetricSourcePropTypes) {
  const [task] = useCurrentTask(id);

  if (!task) return;

  return (
    <div className="flex flex-col gap-2">
      <SelectTaskType id={task.id ?? ""} />
      {task.source &&
        !unsupportedConnctorTypeOptions.includes(task?.type ?? "") && (
          <div className="flex gap-2 items-center">
            <SelectConnectorOption id={task.id} />
          </div>
        )}
    </div>
  );
}

export default AddMetricSource;
