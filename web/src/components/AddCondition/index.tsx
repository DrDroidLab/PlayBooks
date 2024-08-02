import useCurrentStep from "../../hooks/playbooks/step/useCurrentStep.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions.ts";
import handleTaskTypeOptions from "../../utils/conditionals/handleTaskTypeOptions.ts";
import { extractSource } from "../../utils/playbook/extractData.ts";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched.ts";
import Condition from "./Condition.tsx";

function AddCondition() {
  const { source, id } = useSelector(additionalStateSelector);
  const { rules, addNewRule } = useEdgeConditions(id);
  const sourceId = extractSource(source);
  const [parentStep] = useCurrentStep(sourceId);
  const isPrefetched = useIsPrefetched();

  const taskTypeOptions = handleTaskTypeOptions(parentStep);

  return (
    <div className="p-2">
      <h1 className="text-violet-500 font-semibold text-xs flex justify-between my-2">
        <span>Add Condition</span>
      </h1>
      <hr />

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
          <CustomButton className="!w-fit my-2" onClick={addNewRule}>
            <Add fontSize="inherit" /> Add
          </CustomButton>
        </>
      )}
    </div>
  );
}

export default AddCondition;
