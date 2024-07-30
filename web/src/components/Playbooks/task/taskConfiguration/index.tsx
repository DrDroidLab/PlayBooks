import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask";
import { ResultTypeTypes } from "../../../../utils/conditionals/resultTypeOptions";
import BulkTaskSelector from "./bulkTasks/BulkTaskSelector";
import ComparisonSelector from "./comparison/ComparisonSelector";

type TaskConfigurationPropTypes = {
  id: string;
};

function TaskConfiguration({ id }: TaskConfigurationPropTypes) {
  const [task] = useCurrentTask(id);

  return (
    <div>
      <div className="mt-2 text-sm text-violet-500">
        <b>Configuration</b>
      </div>
      <BulkTaskSelector id={id} />
      {task?.ui_requirement.resultType === ResultTypeTypes.TIMESERIES && (
        <ComparisonSelector id={id} />
      )}
    </div>
  );
}

export default TaskConfiguration;
