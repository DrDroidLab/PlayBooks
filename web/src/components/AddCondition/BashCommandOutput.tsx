// If condition is grep_exists, operator is greater_than_eq_o and grep_count is 1

// If condition is does_not_exist, operator is equal_o and grep_count is 0

// condition_type = grep_pattern in both situations

// checkbox must be activated.

import React from "react";
import SelectComponent from "../SelectComponent/index.jsx";
import ValueComponent from "../ValueComponent/index.jsx";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import Checkbox from "../common/Checkbox/index.tsx";
import { bashCommandOutputOptions } from "../../utils/conditionals/typeOptions/index.ts";
import { addConditionToEdgeByIndex } from "../../utils/conditionals/addConditionToEdgeByIndex.ts";

function BashCommandOutput({ rule, condition, conditionIndex }) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition, edgeIndex } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string | undefined, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <SelectComponent
          error={undefined}
          data={bashCommandOutputOptions}
          selected={rule.type}
          placeholder={`Select Type`}
          onSelectionChange={(id: string) =>
            handleChange(id, `${keyValue}.type`)
          }
        />
      </div>

      <div className="flex flex-col gap-1">
        <ValueComponent
          error={undefined}
          valueType={"STRING"}
          onValueChange={(val: string) =>
            handleChange(val, `${keyValue}.pattern`)
          }
          value={rule.pattern}
          valueOptions={[]}
          placeHolder={"Enter pattern to evaluate"}
          length={200}
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Checkbox
          id="case_sensitive"
          isChecked={rule.case_sensitive}
          onChange={() => {
            addConditionToEdgeByIndex(
              `${keyValue}.case_sensitive`,
              !rule.case_sensitive,
              edgeIndex,
              conditionIndex,
            );
          }}
          label="Pattern is Case Sensitive"
          isSmall={true}
        />
      </div>
    </>
  );
}

export default BashCommandOutput;
