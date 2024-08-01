import { unsupportedConnctorTypeOptions } from "../../../utils/playbook/unsupportedConnctorTypeOptions";
import SelectConnectorOptionDynamicAlerts from "./source/SelectConnectorOption";
import SelectSourceDynamicAlerts from "./source/SelectSource";
import SelectTaskTypeDynamicAlerts from "./source/SelectTaskType";

function AddSource() {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex mt-2 gap-2">
        <div className="flex items-center gap-2">
          {/* <SelectSourceDynamicAlerts id={currentTaskId} /> */}
          {/* <SelectTaskTypeDynamicAlerts id={currentTaskId} /> */}
        </div>
      </div>
      {/* {!unsupportedConnctorTypeOptions.includes(task?.type ?? "") && (
        <div className="flex gap-2 items-center">
          <SelectConnectorOptionDynamicAlerts id={currentTaskId} />
        </div>
      )} */}
    </div>
  );
}

export default AddSource;
