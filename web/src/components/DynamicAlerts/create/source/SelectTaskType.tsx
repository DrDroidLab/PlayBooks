import { useDispatch, useSelector } from "react-redux";
import { updateTaskType } from "../../../../store/features/playbook/playbookSlice.ts";
import { updateCardById } from "../../../../utils/execution/updateCardById.ts";
import useIsPrefetched from "../../../../hooks/playbooks/useIsPrefetched.ts";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";
import CustomInput from "../../../Inputs/CustomInput.tsx";
import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask.ts";
import { commonKeySelector } from "../../../../store/features/common/commonSlice.ts";

function SelectTaskTypeDynamicAlerts({ id }) {
  const { connectorOptions } = useSelector(commonKeySelector);
  const [task, currentId] = useCurrentTask(id);
  const currentConnector = connectorOptions?.find(
    (e) => e.id === task?.source,
  )?.connector;
  const taskType = task?.[task?.source?.toLowerCase()]?.type;
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();
  const taskTypes = currentConnector?.supported_task_type_options ?? [];
  const options = taskTypes.map((type) => ({
    id: type.task_type,
    label: type.display_name,
    type: type,
  }));

  function handleTaskTypeChange(id: string) {
    const val = options.find((e) => e.id === id);
    const currentTaskType = currentConnector?.supported_task_type_options?.find(
      (e) => e.task_type === id,
    );
    dispatch(updateTaskType({ id: currentId, value: id }));
    updateCardById(
      "ui_requirement.resultType",
      currentTaskType.result_type,
      currentId,
    );
    if (!task?.ui_requirement?.userEnteredDescription)
      updateCardById("description", val.type.display_name, currentId);
  }

  return (
    <div className="flex flex-col">
      <CustomInput
        label="Task Type"
        options={options}
        inputType={InputTypes.DROPDOWN}
        value={taskType}
        handleChange={handleTaskTypeChange}
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default SelectTaskTypeDynamicAlerts;
