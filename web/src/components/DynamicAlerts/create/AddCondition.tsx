import { InputTypes } from "../../../types";
import { ruleOptions } from "../../../utils/conditionals/ruleOptions";
import CustomInput from "../../Inputs/CustomInput";

function AddCondition() {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold text-violet-500 text-sm">Conditions</p>
      <div className="flex flex-col items-start gap-1 mt-4">
        <p className="text-xs text-violet-500 font-semibold">
          Select a global rule
        </p>
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          options={ruleOptions}
          value={""}
          placeholder={`Select Global Rule`}
          handleChange={() => {}}
          error={undefined}
        />
      </div>
    </div>
  );
}

export default AddCondition;
