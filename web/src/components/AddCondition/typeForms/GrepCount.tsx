import React from "react";
import ValueComponent from "../../ValueComponent";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";
import Checkbox from "../../common/Checkbox/index.tsx";
import { addConditionToEdgeByIndex } from "../../../utils/conditionals/addConditionToEdgeByIndex.ts";

function GrepCount({ condition, conditionIndex, rule }: HandleTypesPropTypes) {
  const { id, edgeIndex } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string, type: string) => {
    handleCondition(`${keyValue}.${type}`, val, conditionIndex);
  };
  return (
    <>
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

export default GrepCount;
