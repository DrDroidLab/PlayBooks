import SelectTaskType from "./SelectTaskType.jsx";
import SelectSource from "./SelectSource.jsx";
import SelectConnectorOption from "./SelectConnectorOption.jsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { unsupportedConnctorTypeOptions } from "../../../utils/unsupportedConnctorTypeOptions.ts";

function AddSource({ index }) {
  const [step] = useCurrentStep(index);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex mt-2 gap-2">
        <div className="flex items-center gap-2">
          <SelectSource index={index} />
          <SelectTaskType index={index} />
        </div>
      </div>
      {!unsupportedConnctorTypeOptions.includes(step.taskType) && (
        <div className="flex gap-2 items-center">
          <SelectConnectorOption index={index} />
        </div>
      )}
    </div>
  );
}

export default AddSource;
