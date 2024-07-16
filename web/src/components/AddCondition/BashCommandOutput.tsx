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
import useCurrentStep from "../../hooks/useCurrentStep.ts";
import handleTaskTypeOptions from "../../utils/conditionals/handleTaskTypeOptions.ts";
import Checkbox from "../common/Checkbox/index.tsx";
import { operationOptions } from "../../utils/conditionals/operationOptions.ts";
import { bashCommandOutputOptions } from "../../utils/conditionals/typeOptions/index.ts";
import HandleTypes from "./HandleTypes.tsx";
import { extractSource } from "../../utils/extractData.ts";

function BashCommandOutput({ condition, conditionIndex }) {
  const { source, id } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);
  const sourceId = extractSource(source);
  const [parentStep] = useCurrentStep(sourceId);
  const taskTypeOptions = handleTaskTypeOptions(parentStep);

  const handleChange = (val: string, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <SelectComponent
          data={taskTypeOptions}
          selected={condition.task}
          placeholder={`Select Task`}
          onSelectionChange={(id: string) => handleChange(id, "task")}
        />
      </div>

      <div className="flex items-center gap-1">
        <SelectComponent
          data={bashCommandOutputOptions}
          selected={condition.conditionType}
          placeholder={`Select Condition`}
          onSelectionChange={(id: string) => handleChange(id, "conditionType")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val: string) => handleChange(val, "pattern")}
          value={condition.pattern}
          valueOptions={[]}
          placeHolder={"Enter pattern to evaluate"}
          length={200}
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Checkbox
          id="caseSensitive"
          isChecked={condition.caseSensitive}
          onChange={() => {handleChange("caseSensitive",condition.caseSensitive)}}
          label="Pattern is Case Sensitive"
          isSmall={true}
        />
      </div>

      <HandleTypes condition={condition} conditionIndex={conditionIndex} />

    </>
  );
}

export default BashCommandOutput;
