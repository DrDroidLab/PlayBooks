import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions.ts";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched.ts";
import VariableCondition from "./VariableCondition.tsx";

function AddVariableCondition() {
  const { id } = useSelector(additionalStateSelector);
  const { variable_rules, addNewVariableRule } = useEdgeConditions(id);
  const isPrefetched = useIsPrefetched();

  return (
    <>
      <h1 className="text-violet-500 font-semibold text-xs flex justify-between my-2">
        <span>Add Variable Conditions</span>
      </h1>
      <hr />

      {variable_rules?.map((condition, i) => (
        <VariableCondition key={i} i={i} condition={condition} />
      ))}

      {!isPrefetched && (
        <>
          <CustomButton className="!w-fit my-2" onClick={addNewVariableRule}>
            <Add fontSize="inherit" /> Add
          </CustomButton>
        </>
      )}
    </>
  );
}

export default AddVariableCondition;
