import { useSelector } from "react-redux";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";
import CustomInput from "../../../Inputs/CustomInput.tsx";
import { commonKeySelector } from "../../../../store/features/common/commonSlice.ts";

function SelectTaskTypeDynamicAlerts() {
  const { connectorOptions } = useSelector(commonKeySelector);
  const currentConnector = connectorOptions?.find(
    (e) => e.id === "",
  )?.connector;
  const taskTypes = currentConnector?.supported_task_type_options ?? [];
  const options = taskTypes.map((type) => ({
    id: type.task_type,
    label: type.display_name,
    type: type,
  }));

  function handleTaskTypeChange(id: string) {}

  return (
    <div className="flex flex-col">
      <CustomInput
        label="Task Type"
        options={options}
        inputType={InputTypes.DROPDOWN}
        value={""}
        handleChange={handleTaskTypeChange}
      />
    </div>
  );
}

export default SelectTaskTypeDynamicAlerts;
