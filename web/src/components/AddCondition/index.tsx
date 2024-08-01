import useCurrentStep from "../../hooks/playbooks/step/useCurrentStep.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add, ErrorOutlineRounded } from "@mui/icons-material";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions.ts";
import { ruleOptions } from "../../utils/conditionals/ruleOptions.ts";
import handleTaskTypeOptions from "../../utils/conditionals/handleTaskTypeOptions.ts";
import { extractSource } from "../../utils/playbook/extractData.ts";
import SavePlaybookButton from "../Buttons/SavePlaybookButton/index.tsx";
import CustomInput from "../Inputs/CustomInput.tsx";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched.ts";
import Condition from "./Condition.tsx";

function AddCondition() {
  const { source, id } = useSelector(additionalStateSelector);
  const { rules, condition, addNewRule, handleGlobalRule } =
    useEdgeConditions(id);
  const sourceId = extractSource(source);
  const [parentStep] = useCurrentStep(sourceId);
  const isPrefetched = useIsPrefetched();

  const taskTypeOptions = handleTaskTypeOptions(parentStep);

  return (
    <div className="p-2">
      <h1 className="text-violet-500 font-semibold text-lg flex justify-between my-2">
        <span>Add Condition</span>
      </h1>
      <hr />

      {taskTypeOptions.length === 0 && (
        <div className="bg-red-50 p-2 flex items-center gap-1 my-1 rounded flex-wrap">
          <ErrorOutlineRounded
            color="error"
            component={"svg"}
            fontSize="inherit"
          />
          <p className="text-xs">
            You have not configured the parent step yet.
          </p>
        </div>
      )}

      <div className="flex flex-col items-start gap-1 mt-4">
        <p className="text-xs text-violet-500 font-semibold">
          Select a global rule
        </p>
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          options={ruleOptions}
          value={condition?.logical_operator ?? ""}
          placeholder={`Select Global Rule`}
          handleChange={handleGlobalRule}
          error={undefined}
          disabled={!!isPrefetched}
        />
      </div>

      {rules?.map((condition, i) => (
        <Condition
          key={i}
          i={i}
          condition={condition}
          taskTypeOptions={taskTypeOptions}
        />
      ))}

      {!isPrefetched && (
        <>
          <CustomButton className="!text-sm !w-fit my-2" onClick={addNewRule}>
            <Add fontSize="inherit" /> Add
          </CustomButton>

          <SavePlaybookButton />
        </>
      )}
    </div>
  );
}

export default AddCondition;
