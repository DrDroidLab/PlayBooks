import React from "react";
import { functionOptions } from "../../utils/conditionals/functionOptions.ts";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { useSelector } from "react-redux";
import { operationOptions } from "../../utils/conditionals/operationOptions.ts";
import { timeseriesOptions } from "../../utils/conditionals/typeOptions/timeseries.ts";
import HandleTypes from "./HandleTypes.tsx";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import {
  ResultTypeType,
  ResultTypeTypes,
} from "../../utils/conditionals/resultTypeOptions.ts";
import CustomInput from "../Inputs/CustomInput.tsx";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

function Timeseries({ condition, conditionIndex, rule, resultType }) {
  const { id } = useSelector(additionalStateSelector);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const { handleCondition } = useEdgeConditions(id);
  const task = tasks?.find((e) => e.id === condition?.task?.id);

  const handleChange = (val: string, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <CustomInput
          type={InputTypes.DROPDOWN}
          options={timeseriesOptions}
          value={rule.type}
          placeholder={`Select Type`}
          handleChange={(id: string) =>
            handleChange(id, `${resultType?.toLowerCase()}.type`)
          }
        />
      </div>

      <HandleTypes
        condition={condition}
        conditionIndex={conditionIndex}
        rule={rule}
      />

      <div className="flex items-center gap-1">
        <CustomInput
          type={InputTypes.DROPDOWN}
          options={functionOptions(
            (task?.ui_requirement?.resultType as ResultTypeType) ??
              ResultTypeTypes.OTHERS,
          )}
          value={rule.function}
          placeholder={`Select Function`}
          handleChange={(id: string) =>
            handleChange(id, `${resultType?.toLowerCase()}.function`)
          }
        />
      </div>

      <div className="flex items-center gap-1">
        <CustomInput
          type={InputTypes.DROPDOWN}
          options={operationOptions}
          value={rule.operator}
          placeholder={`Select Operator`}
          handleChange={(id: string) =>
            handleChange(id, `${resultType?.toLowerCase()}.operator`)
          }
        />
      </div>

      <div className="flex items-center gap-1">
        <CustomInput
          type={InputTypes.TEXT}
          handleChange={(val: string) =>
            handleChange(val, `${resultType?.toLowerCase()}.threshold`)
          }
          value={rule.threshold}
          placeholder={"Enter Value of condition"}
          length={200}
        />
      </div>
    </>
  );
}

export default Timeseries;
