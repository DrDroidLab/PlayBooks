import AddMetric from "../../components/DynamicAlerts/create/AddMetric";
import Heading from "../../components/Heading";
import CustomInput from "../../components/Inputs/CustomInput";
import { usePlaybookBuilderOptionsQuery } from "../../store/features/playbook/api";
import { InputTypes } from "../../types";

function CreateDynamicAlert() {
  usePlaybookBuilderOptionsQuery();

  return (
    <div>
      <Heading heading={"Dynamic Alerts(beta)"} />
      <div className="p-6 flex flex-col gap-3 bg-white border rounded m-2">
        <CustomInput
          inputType={InputTypes.TEXT}
          label="Alert name"
          value={""}
          className="!w-[200px]"
        />
        <AddMetric />
      </div>
    </div>
  );
}

export default CreateDynamicAlert;
