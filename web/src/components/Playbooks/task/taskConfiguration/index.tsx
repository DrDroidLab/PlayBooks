import BulkTaskSelector from "./bulkTasks/BulkTaskSelector";
import ComparisonSelector from "./comparison/ComparisonSelector";

type TaskConfigurationPropTypes = {
  id: string;
};

function TaskConfiguration({ id }: TaskConfigurationPropTypes) {
  return (
    <div>
      <div className="mt-2 text-sm text-violet-500">
        <b>Configuration</b>
      </div>
      <BulkTaskSelector id={id} />
      <ComparisonSelector id={id} />
    </div>
  );
}

export default TaskConfiguration;
