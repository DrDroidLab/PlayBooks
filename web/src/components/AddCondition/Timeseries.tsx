import React from "react";
import SelectComponent from "../SelectComponent";
import { functionOptions } from "../../utils/conditionals/functionOptions.ts";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { useSelector } from "react-redux";
import ValueComponent from "../ValueComponent/index.jsx";
import { operationOptions } from "../../utils/conditionals/operationOptions.ts";
import { timeseriesOptions } from "../../utils/conditionals/typeOptions/timeseries.ts";
import HandleTypes from "./HandleTypes.tsx";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import {
  ResultTypeType,
  ResultTypeTypes,
} from "../../utils/conditionals/resultTypeOptions.ts";

function Timeseries({ condition, conditionIndex, rule, resultType }) {
  const { id } = useSelector(additionalStateSelector);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const { handleCondition } = useEdgeConditions(id);
  const task = tasks?.find((e) => e.id === condition.task);

  const handleChange = (val: string, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  return (
    <>
      {/* <div className="flex items-center gap-1">
        <SelectComponent
          data={taskTypeOptions}
          selected={condition.task}
          placeholder={`Select Task`}
          onSelectionChange={(id: string) => handleChange(id, "task")}
        />
      </div> */}

      <div className="flex items-center gap-1">
        <SelectComponent
          data={timeseriesOptions}
          selected={rule.type}
          placeholder={`Select Type`}
          onSelectionChange={(id: string) =>
            handleChange(id, `${resultType?.toLowerCase()}.type`)
          }
        />
      </div>

      <HandleTypes condition={condition} conditionIndex={conditionIndex} />

      <div className="flex items-center gap-1">
        <SelectComponent
          data={functionOptions(
            (task?.ui_requirement?.resultType as ResultTypeType) ??
              ResultTypeTypes.OTHERS,
          )}
          selected={rule.function}
          placeholder={`Select Function`}
          onSelectionChange={(id: string) =>
            handleChange(id, `${resultType?.toLowerCase()}.function`)
          }
        />
      </div>

      <div className="flex items-center gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Operation</p> */}
        <SelectComponent
          data={operationOptions}
          selected={rule.operator}
          placeholder={`Select Operator`}
          onSelectionChange={(id: string) =>
            handleChange(id, `${resultType?.toLowerCase()}.operator`)
          }
        />
      </div>

      <div className="flex items-center gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Value</p> */}
        <ValueComponent
          error={undefined}
          valueType={"STRING"}
          onValueChange={(val: string) =>
            handleChange(val, `${resultType?.toLowerCase()}.threshold`)
          }
          value={rule.threshold}
          valueOptions={[]}
          placeHolder={"Enter Value of condition"}
          length={200}
        />
      </div>
    </>
  );
}

export default Timeseries;
