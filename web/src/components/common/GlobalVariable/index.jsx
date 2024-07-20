import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  deleteVariable,
  updateGlobalVariable,
} from "../../../store/features/playbook/playbookSlice.ts";
import AddVariableOverlay from "./AddVariableOverlay.jsx";
import { CloseRounded } from "@mui/icons-material";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import CustomButton from "../CustomButton/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function GlobalVariables() {
  const [isAddVariableOpen, setIsAddVariableOpen] = useState(false);
  const playbook = useSelector(currentPlaybookSelector);
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();
  const variables = playbook?.global_variable_set;

  const openOverlay = () => {
    setIsAddVariableOpen(true);
  };

  const handleDelete = (key) => {
    dispatch(deleteVariable({ name: key }));
  };

  if (isPrefetched && Object.keys(variables).length === 0) {
    return null;
  }

  return (
    <div
      className={`w-[330px] my-0 text-sm p-1 border rounded min-h-[100px] bg-white`}>
      <div style={{ paddingLeft: 0 }} className="flex items-center gap-2 p-1">
        {!isPrefetched && (
          <CustomButton onClick={openOverlay}>+ Add Variable</CustomButton>
        )}
        {playbook?.globalVariables?.length > 0 &&
          `(${playbook?.globalVariables?.length} variable${
            playbook?.globalVariables?.length > 1 ? "s" : ""
          })`}
      </div>
      {!isPrefetched && <hr />}
      <div className="flex items-center flex-wrap gap-1 mt-2">
        {Object.keys(playbook?.global_variable_set ?? {})?.length > 0 ? (
          Object.keys(playbook?.global_variable_set ?? {}).map((key) => (
            <div key={key} className={`flex gap-1 flex-wrap p-1`}>
              <div className="bg-violet-100 p-1 flex items-center rounded w-[80px]">
                <p className="text-xs text-center text-ellipsis overflow-hidden">
                  {key}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <CustomInput
                  inputType={InputTypes.TEXT}
                  value={variables[key]}
                  placeholder={"Enter variable value"}
                  className="!w-[200px]"
                  handleChange={(val) => {
                    dispatch(updateGlobalVariable({ name: key, value: val }));
                  }}
                />
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
