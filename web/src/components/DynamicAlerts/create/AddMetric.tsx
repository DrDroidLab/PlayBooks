import { useSelector } from "react-redux";
import AddSource from "../../Playbooks/task/AddSource";
import Details from "../../Playbooks/task/Details";
import { currentPlaybookSelector } from "../../../store/features/playbook/selectors";
import RunButton from "../../Buttons/RunButton";
import HandleOutput from "../../Playbooks/task/HandleOutput";

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

  if (!currentTask?.id) return;

  return (
    <div className="flex flex-col gap-1 border p-2 rounded">
      <p className="font-bold text-violet-500 text-sm">Metric</p>
      <div className="flex w-full gap-4 justify-start">
        <div className="flex flex-col flex-[0.5]">
          <AddSource id={currentTask.id} />
          <Details id={currentTask.id} />
          <div className="w-fit mt-2">
            <RunButton id={currentTask.id} />
          </div>
        </div>
        <div className="flex-[0.6] max-h-[400px] overflow-scroll">
          <HandleOutput id={currentTask.id} />
        </div>
      </div>
    </div>
  );
}

export default AddMetric;
