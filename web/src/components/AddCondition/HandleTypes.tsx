import React from "react";
import ValueComponent from "../ValueComponent";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { useSelector } from "react-redux";
import Checkbox from "../common/Checkbox/index.tsx";
import { addConditionToEdgeByIndex } from "../../utils/conditionals/addConditionToEdgeByIndex.ts";

type HandleTypesPropTypes = {
  condition: any;
  conditionIndex: number;
  rule: any;
};

function HandleTypes({
  condition,
  conditionIndex,
  rule,
}: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition, edgeIndex } = useEdgeConditions(id);
  const type = rule?.type;

  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string, type: string) => {
    handleCondition(`${keyValue}.${type}`, val, conditionIndex);
  };

  switch (type) {
    case "ROLLING":
      return (
        <div className="flex items-center gap-1">
          <ValueComponent
            valueType={"STRING"}
            onValueChange={(val: string) => handleChange(val, "window")}
            value={rule.window}
            valueOptions={[]}
            placeHolder={"Enter window size"}
            length={200}
            error={undefined}
          />
        </div>
      );
    case "CUMULATIVE":
      return <></>;
    case "ROW_COUNT":
      return <></>;
    case "COLUMN_VALUE":
      return (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <ValueComponent
              valueType={"STRING"}
              onValueChange={(val: string) => handleChange(val, "column_name")}
              value={rule.column_name}
              valueOptions={[]}
              placeHolder={"Enter column name"}
              length={200}
              error={undefined}
            />
            <Checkbox
              id="isNumeric"
              isChecked={rule.isNumeric}
              onChange={() => {
                addConditionToEdgeByIndex(
                  `${keyValue}.isNumeric`,
                  !rule.isNumeric,
                  edgeIndex,
                  conditionIndex,
                );
              }}
              label="Is Numeric"
              isSmall={true}
            />
          </div>
        </>
      );
    case "GREP_COUNT":
      return (
        <>
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
    default:
      return <></>;
  }
}

export default HandleTypes;
