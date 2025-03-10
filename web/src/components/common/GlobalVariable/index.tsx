import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  deleteVariable,
  updateGlobalVariable,
} from "../../../store/features/playbook/playbookSlice.ts";
import AddVariableOverlay from "./AddVariableOverlay.js";
import { Add, CloseRounded, DescriptionRounded } from "@mui/icons-material";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import CustomButton from "../CustomButton/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import { Tooltip } from "@mui/material";
import { checkIfJSON } from "../../../utils/common/checkIfJSON.ts";

function GlobalVariables() {
  const [isAddVariableOpen, setIsAddVariableOpen] = useState(false);
  const playbook = useSelector(currentPlaybookSelector);
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();

  const variables = playbook?.global_variable_set ?? {};
  const globalVariables = Object.keys(variables);

  const openOverlay = () => {
    setIsAddVariableOpen(true);
  };

  const handleDelete = (key) => {
    dispatch(deleteVariable({ name: key }));
  };

  if (isPrefetched && globalVariables.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-[330px] my-0 text-sm p-1 border rounded min-h-[100px] bg-white`}>
      <div style={{ paddingLeft: 0 }} className="flex items-center gap-2 p-1">
        {!isPrefetched && (
          <CustomButton onClick={openOverlay}>
            <Add fontSize="small" /> Variable
          </CustomButton>
        )}
        {globalVariables?.length > 0 &&
          `(${globalVariables?.length} variable${
            globalVariables?.length > 1 ? "s" : ""
          })`}
      </div>
      {!isPrefetched && <hr />}
      <div className="flex items-center flex-wrap gap-1 mt-2">
        {globalVariables?.length > 0 ? (
          globalVariables.map((key) => (
            <div key={key} className={`flex gap-1 flex-wrap p-1`}>
              <div className="bg-violet-100 p-1 flex items-center rounded w-[80px]">
                <Tooltip title={key}>
                  <p className="text-xs text-center text-ellipsis overflow-hidden">
                    {key}
                  </p>
                </Tooltip>
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative flex items-center gap-1">
                  <CustomInput
                    inputType={InputTypes.TEXT}
                    value={variables[key]}
                    placeholder={"Enter variable value"}
                    className="!w-[200px]"
                    handleChange={(val) => {
                      dispatch(updateGlobalVariable({ name: key, value: val }));
                    }}
                  />
                  <div className="absolute right-2">
                    {checkIfJSON(variables[key]) && (
                      <Tooltip
                        title={
                          <pre style={{ margin: 0 }}>
                            {JSON.stringify(
                              JSON.parse(variables[key]),
                              null,
                              2,
                            )}
                          </pre>
                        }>
                        <DescriptionRounded
                          className="text-gray-500 bg-white cursor-pointer"
                          fontSize="small"
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>
                {!isPrefetched && (
                  <CloseRounded
                    onClick={() => handleDelete(key)}
                    className="text-black cursor-pointer hover:text-red-500 transition-all !text-sm"
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-xs">
            Variables defined in the playbook will be visible here. Read more
            about variables{" "}
            <a
              href="https://docs.drdroid.io/docs/global-variables"
              target="_blank"
              rel="noreferrer"
              className="text-violet-600">
              here
            </a>
            .
          </p>
        )}
      </div>

      <AddVariableOverlay
        isOpen={isAddVariableOpen}
        close={() => setIsAddVariableOpen(false)}
      />
    </div>
  );
}

export default GlobalVariables;
