import CustomInput from "../../Inputs/CustomInput";
import { InputTypes } from "../../../types";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask";
import { useDispatch, useSelector } from "react-redux";
import { commonKeySelector } from "../../../store/features/common/selectors";
import { ResultTypeTypes } from "../../../utils/conditionals/resultTypeOptions";
import { updateCardById } from "../../../utils/execution/updateCardById";
import {
  updateTaskType,
  updateSource,
} from "../../../store/features/playbook/playbookSlice";

const resultTypeKeysAvailable = [ResultTypeTypes.TIMESERIES];

type SelectTaskTypePropTypes = {
  id: string;
};

function SelectTaskType({ id }: SelectTaskTypePropTypes) {
  const dispatch = useDispatch();
  const { supportedTaskTypes } = useSelector(commonKeySelector);
  const options = (
    supportedTaskTypes?.filter((type) =>
      resultTypeKeysAvailable.includes(type.result_type),
    ) ?? []
  ).map((type) => ({
    id: `${type.source}-${type.task_type}`,
    label: type.display_name,
    type: type,
  }));
  const [task, currentId] = useCurrentTask(id);
  const taskType = task?.[task?.source?.toLowerCase()]?.type;

  const handleTaskTypeChange = (id: string) => {
    const val = options.find((e) => e.id === id)?.type;
    if (!val) return;
    dispatch(updateSource({ id: currentId, value: val.source }));
    dispatch(updateTaskType({ id: currentId, value: val.task_type }));
    updateCardById("ui_requirement.resultType", val.result_type, currentId);
    updateCardById(
      "ui_requirement.model_type",
      val.supported_model_types?.[0]?.model_type ?? task?.source,
      currentId,
    );
    if (!task?.ui_requirement?.userEnteredDescription)
      updateCardById("description", val.display_name, currentId);
  };

  return (
    <div className="flex flex-col">
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        label="Task Type"
        options={options}
        value={`${task?.source}-${taskType}`}
        handleChange={handleTaskTypeChange}
      />
    </div>
  );
}

export default SelectTaskType;
