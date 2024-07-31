import React from "react";
import { functionOptions } from "../../utils/conditionals/functionOptions.ts";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions.ts";
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
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched.ts";

function Timeseries({ condition, conditionIndex, rule, resultType }) {
  const { id } = useSelector(additionalStateSelector);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const { handleCondition } = useEdgeConditions(id);
  const task = tasks?.find((e) => e.id === condition?.task?.id);
  const isPrefetched = useIsPrefetched();

  const handleChange = (val: string, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        options={timeseriesOptions}
        disabled={!!isPrefetched}
        value={rule.type}
        placeholder={`Select Type`}
        handleChange={(id: string) =>
          handleChange(id, `${resultType?.toLowerCase()}.type`)
        }
      />

      <HandleTypes
        condition={condition}
        conditionIndex={conditionIndex}
        rule={rule}
      />

      <CustomInput
        inputType={InputTypes.DROPDOWN}
        disabled={!!isPrefetched}
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

      <CustomInput
        inputType={InputTypes.DROPDOWN}
        disabled={!!isPrefetched}
        options={operationOptions}
        value={rule.operator}
        placeholder={`Select Operator`}
        handleChange={(id: string) =>
          handleChange(id, `${resultType?.toLowerCase()}.operator`)
        }
      />

      <CustomInput
        inputType={InputTypes.TEXT}
        disabled={!!isPrefetched}
        handleChange={(val: string) =>
          handleChange(val, `${resultType?.toLowerCase()}.threshold`)
        }
        value={rule.threshold}
        placeholder={"Enter Value of condition"}
        className="!w-[200px]"
      />
    </div>
  );
}

export default Timeseries;
