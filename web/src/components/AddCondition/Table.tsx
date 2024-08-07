import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions.ts";
import { operationOptions } from "../../utils/conditionals/operationOptions.ts";
import { tableOptions } from "../../utils/conditionals/typeOptions/index.ts";
import HandleTypes from "./HandleTypes.tsx";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import CustomInput from "../Inputs/CustomInput.tsx";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched.ts";
import { RuleType } from "../common/Conditions/types/RuleTypes.ts";

function Table({ condition, conditionIndex, rule }) {
  const { id } = useSelector(additionalStateSelector);
  const { handleRule } = useEdgeConditions(id);
  const isPrefetched = useIsPrefetched();

  const handleChange = (val: string | undefined, type: string) => {
    handleRule(type, val, conditionIndex, RuleType.RULE);
  };

  const checkIfNumeric = rule.isNumeric || rule.type === "ROW_COUNT";

  const threshold = checkIfNumeric
    ? rule.numeric_value_threshold
    : rule.string_value_threshold;

  return (
    <div className="flex flex-wrap gap-2">
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        error={undefined}
        options={tableOptions}
        value={rule.type}
        placeholder={`Select Type`}
        handleChange={(id: string) =>
          handleChange(id, `${condition.type?.toLowerCase()}.type`)
        }
        disabled={!!isPrefetched}
      />

      <HandleTypes
        condition={condition}
        rule={rule}
        conditionIndex={conditionIndex}
      />

      <CustomInput
        inputType={InputTypes.DROPDOWN}
        error={undefined}
        options={
          checkIfNumeric
            ? operationOptions
            : operationOptions.filter((e) => e.id === "EQUAL_O")
        }
        value={rule.operator}
        placeholder={`Select Operator`}
        handleChange={(id: string) =>
          handleChange(id, `${condition.type?.toLowerCase()}.operator`)
        }
        disabled={!!isPrefetched}
      />

      <CustomInput
        inputType={InputTypes.TEXT}
        disabled={!!isPrefetched}
        handleChange={(val: string) => {
          if (checkIfNumeric) {
            handleChange(
              undefined,
              `${condition.type?.toLowerCase()}.string_value_threshold`,
            );
            handleChange(
              val,
              `${condition.type?.toLowerCase()}.numeric_value_threshold`,
            );
          } else {
            handleChange(
              undefined,
              `${condition.type?.toLowerCase()}.numeric_value_threshold`,
            );
            handleChange(
              val,
              `${condition.type?.toLowerCase()}.string_value_threshold`,
            );
          }
        }}
        value={threshold}
        placeholder={"Enter threshold of condition"}
        className="!w-[200px]"
      />
    </div>
  );
}

export default Table;
