import { unsupportedConnctorTypeOptions } from "../../../utils/playbook/unsupportedConnctorTypeOptions";
import SelectConnectorOptionDynamicAlerts from "./source/SelectConnectorOptionDynamicAlerts";
import SelectSourceDynamicAlerts from "./source/SelectSourceDynamicAlerts";
import SelectTaskTypeDynamicAlerts from "./source/SelectTaskTypeDynamicAlerts";

function AddSource() {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative items-center flex gap-2">
        <SelectSourceDynamicAlerts />
        <SelectTaskTypeDynamicAlerts />
      </div>
      {!unsupportedConnctorTypeOptions.includes("") && (
        <div className="flex gap-2 items-center">
          <SelectConnectorOptionDynamicAlerts />
        </div>
      )}
    </div>
  );
}

export default AddSource;
