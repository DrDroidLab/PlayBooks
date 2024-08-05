import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions.ts";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched.ts";
import StepConditions from "./StepConditions.tsx";

function AddStepCondition() {
  const { id } = useSelector(additionalStateSelector);
  const { addNewStepRule, step_rules } = useEdgeConditions(id);
  const isPrefetched = useIsPrefetched();

  return (
    <div className="my-4">
      {step_rules?.map((rule, i) => (
        <StepConditions rule={rule} ruleIndex={i} />
      ))}

      {!isPrefetched && step_rules.length === 0 && (
        <>
          <CustomButton className="!w-fit my-2" onClick={addNewStepRule}>
            <Add fontSize="inherit" /> Add time condition
          </CustomButton>
        </>
      )}
    </div>
  );
}

export default AddStepCondition;
