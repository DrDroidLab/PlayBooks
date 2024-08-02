import { useSelector } from "react-redux";
import AddSource from "../../Playbooks/task/AddSource";
import Details from "../../Playbooks/task/Details";
import { currentPlaybookSelector } from "../../../store/features/playbook/selectors";

function AddMetric() {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement?.tasks ?? [];
  const steps = currentPlaybook?.steps ?? [];
  if (tasks.length === 0 || steps.length === 0) return;
  if (steps[0].tasks.length === 0) return;
  const firstTask = steps[0].tasks[0];

  const currentTask = tasks.find((e) =>
    typeof firstTask === "string" ? firstTask === e.id : firstTask.id === e.id,
  );

  if (!currentTask) return;

  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold text-violet-500 text-sm">Metric</p>
      <AddSource id={currentTask.id} />
      <Details id={currentTask.id} />
    </div>
  );
}

export default AddMetric;
