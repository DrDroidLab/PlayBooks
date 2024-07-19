import React from "react";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import ValueComponent from "../../ValueComponent/index.jsx";
import Checkbox from "../../common/Checkbox/index.tsx";
import { addConditionToEdgeByIndex } from "../../../utils/conditionals/addConditionToEdgeByIndex.ts";
import SelectComponent from "../../SelectComponent/index.jsx";
import { operationOptions } from "../../../utils/conditionals/operationOptions.ts";

function GrepCount({ condition, conditionIndex, rule }: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition, edgeIndex } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string, type: string) => {
    handleCondition(`${keyValue}.${type}`, val, conditionIndex);
  };

  return (
    <>
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

      <div className="flex flex-col gap-1">
        <ValueComponent
          error={undefined}
          valueType={"STRING"}
          onValueChange={(val: string) => handleChange(val, `pattern`)}
          value={rule.pattern}
          valueOptions={[]}
          placeHolder={"Enter pattern to evaluate"}
          length={200}
        />
      </div>

      <div className="flex items-center gap-1">
        <SelectComponent
          error={undefined}
          data={operationOptions}
          selected={rule.operator}
          placeholder={`Select Operator`}
          onSelectionChange={(id: string) => handleChange(id, `operator`)}
        />
      </div>

      <div className="flex items-center gap-1">
        <ValueComponent
          error={undefined}
          valueType={"STRING"}
          onValueChange={(val: string) => handleChange(val, `threshold`)}
          value={rule.threshold}
          valueOptions={[]}
          placeHolder={"Enter threshold"}
          length={200}
        />
      </div>
    </>
  );
}

export default GrepCount;
