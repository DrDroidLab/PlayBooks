import useDynamicAlertsKey from "../../../hooks/dynamicAlerts/useDynamicAlertsKey";
import { InputTypes } from "../../../types";
import CustomInput from "../../Inputs/CustomInput";

const evaluationWindowKey = "evaluationWindowInMinutes";

function AddConfiguration() {
  const [evaluationWindowInMinutes, setevaluationWindowInMinutes] =
    useDynamicAlertsKey(evaluationWindowKey);

  return (
    <div className="flex flex-col gap-1 border p-2 rounded">
      <p className="font-bold text-violet-500 text-sm">Configuration</p>
      <CustomInput
        inputType={InputTypes.TEXT}
        label="Evaluation Window (in minutes)"
        type="number"
        value={evaluationWindowInMinutes}
        handleChange={(val: string) => setevaluationWindowInMinutes(val)}
        className="!w-[200px]"
      />
    </div>
  );
}

export default AddConfiguration;
