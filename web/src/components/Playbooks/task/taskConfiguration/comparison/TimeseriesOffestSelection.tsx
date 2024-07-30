import useCurrentTask from "../../../../../hooks/playbooks/task/useCurrentTask";
import useIsPrefetched from "../../../../../hooks/playbooks/useIsPrefetched";
import { updateCardById } from "../../../../../utils/execution/updateCardById";
import CustomInput from "../../../../Inputs/CustomInput";
import { InputTypes } from "../../../../../types";
import {
  CUSTOM_KEY,
  extractTimeFromHours,
  timeseriesOffsetOptions,
} from "./utils";
import getNestedValue from "../../../../../utils/common/getNestedValue";

const key = "execution_configuration.timeseries_offset";
const ui_key = "ui_requirement.timeseries_offset_id";

type TimeseriesOffestSelectionProps = {
  id: string;
};

function TimeseriesOffestSelection({ id }: TimeseriesOffestSelectionProps) {
  const [task] = useCurrentTask(id);
  const ui_value = getNestedValue(task, ui_key);
  const value = getNestedValue(task, key);
  const isPrefetched = useIsPrefetched();

  const handleChange = (optionId: string) => {
    updateCardById(ui_key, optionId, id);
    if (optionId !== CUSTOM_KEY) {
      const hours = optionId.split("-")[1];
      handleTimerangeChange(extractTimeFromHours(hours));
    } else {
      handleTimerangeChange("");
    }
  };

  const handleTimerangeChange = (value: string) => {
    updateCardById(key, value, id);
  };

  return (
    <div className="mt-1 flex flex-col gap-2">
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        options={timeseriesOffsetOptions}
        value={ui_value}
        handleChange={handleChange}
        placeholder="Select a time range"
        disabled={!!isPrefetched}
      />
      {ui_value === CUSTOM_KEY && (
        <CustomInput
          inputType={InputTypes.TEXT}
          type="number"
          value={value}
          handleChange={handleTimerangeChange}
          placeholder="Enter number of hours"
          disabled={!!isPrefetched}
          label="Number of hours"
        />
      )}
    </div>
  );
}

export default TimeseriesOffestSelection;
