import React from "react";
import { GlobalVariableSet } from "../../../types/globalVariableSet.ts";
import { Tooltip } from "@mui/material";

type GlobalVariablesListPropTypes = {
  global_variable_set: GlobalVariableSet;
};

function GlobalVariablesList({
  global_variable_set,
}: GlobalVariablesListPropTypes) {
  if (Object.keys(global_variable_set ?? {})?.length === 0) return;

  const variables = Object.entries(global_variable_set);

  return (
    <>
      <p className="text-xs font-medium">Variables in the Playbook</p>
      <div className="flex flex-wrap gap-2">
        {variables.map(([key, value]) => (
          <Tooltip title={value} key={key}>
            <div className="text-xs bg-violet-50 p-1 rounded cursor-default">
              {key}
            </div>
          </Tooltip>
        ))}
      </div>
    </>
  );
}

export default GlobalVariablesList;
