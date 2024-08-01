import { useSelector } from "react-redux";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";
import CustomInput from "../../../Inputs/CustomInput.tsx";
import { commonKeySelector } from "../../../../store/features/common/commonSlice.ts";

function SelectSourceDynamicAlerts() {
  const { connectorOptions } = useSelector(commonKeySelector);

  function handleSourceChange(id: string) {}

  return (
    <div className="flex flex-col">
      <CustomInput
        label="Data Source"
        options={connectorOptions}
        inputType={InputTypes.DROPDOWN}
        value={""}
        handleChange={handleSourceChange}
      />
    </div>
  );
}

export default SelectSourceDynamicAlerts;
