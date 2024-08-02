import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions.ts";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched.ts";
import StepConditions from "./StepConditions.tsx";

function AddStepCondition() {
  const { id } = useSelector(additionalStateSelector);
  const { step_rules, addNewStepRule } = useEdgeConditions(id);
  const isPrefetched = useIsPrefetched();

  return (
    <div className="p-2">
      <h1 className="text-violet-500 font-semibold text-lg flex justify-between my-2">
        <span>Add Step Condition</span>
      </h1>
      <hr />

      {step_rules?.map((rule, i) => (
        <StepConditions rule={rule} ruleIndex={i} id={id} />
      ))}

      {!isPrefetched && (
        <>
          <CustomButton
            className="!text-sm !w-fit my-2"
            onClick={addNewStepRule}>
            <Add fontSize="inherit" /> Add
          </CustomButton>
        </>
      )}
    </div>
  );
}

export default AddStepCondition;
