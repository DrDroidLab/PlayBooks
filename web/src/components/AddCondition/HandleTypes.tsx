import React from "react";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { useSelector } from "react-redux";
import Checkbox from "../common/Checkbox/index.tsx";
import { addConditionToEdgeByIndex } from "../../utils/conditionals/addConditionToEdgeByIndex.ts";
import CustomInput from "../Inputs/CustomInput.tsx";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

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
          <CustomInput
            type={InputTypes.TEXT}
            handleChange={(val: string) => handleChange(val, "window")}
            value={rule.window}
            placeholder={"Enter window size"}
            length={200}
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
            <CustomInput
              type={InputTypes.TEXT}
              handleChange={(val: string) => handleChange(val, "column_name")}
              value={rule.column_name}
              placeholder={"Enter column name"}
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
    default:
      return <></>;
  }
}

export default HandleTypes;
