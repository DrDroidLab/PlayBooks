import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask";
import { ResultTypeTypes } from "../../../../utils/conditionals/resultTypeOptions";
import ResultTransformer from "../transformer/ResultTransformer";
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
      <div className="flex flex-col gap-2 mt-2">
        <BulkTaskSelector id={id} />
        {task?.ui_requirement.resultType === ResultTypeTypes.TIMESERIES && (
          <ComparisonSelector id={id} />
        )}
        <ResultTransformer id={id} />
      </div>
    </div>
  );
}

export default TaskConfiguration;
