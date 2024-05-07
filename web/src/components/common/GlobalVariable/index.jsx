import React, { useState } from "react";
import styles from "./styles.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteVariable,
  playbookSelector,
  updateGlobalVariable,
} from "../../../store/features/playbook/playbookSlice.ts";
import ValueComponent from "../../ValueComponent";
import AddVariableOverlay from "./AddVariableOverlay.jsx";
import { Close } from "@mui/icons-material";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

function GlobalVariables() {
  const [isAddVariableOpen, setIsAddVariableOpen] = useState(false);
  const playbook = useSelector(playbookSelector);
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();

  const openOverlay = () => {
    setIsAddVariableOpen(true);
  };

  const handleDelete = (index) => {
    dispatch(deleteVariable({ index }));
  };

  return (
    <div className="text-sm">
      <div style={{ paddingLeft: 0 }} className="flex items-center gap-2 p-1">
        {!isPrefetched && (
          <button
            className={`${styles["pb-button"]} global_var`}
            onClick={openOverlay}>
            + Add Variable
          </button>
        )}
        {playbook?.globalVariables?.length > 0 &&
          `(${playbook?.globalVariables?.length} variable${
            playbook?.globalVariables?.length > 1 ? "s" : ""
          })`}
      </div>
      {!isPrefetched && <hr />}
      <div className={styles.info}>
        {playbook?.globalVariables?.length > 0 ? (
          playbook?.globalVariables.map((variable, index) => (
            <div key={index} className={styles.variable}>
              <div className={styles.name}>{variable.name}</div>
              <ValueComponent
                valueType={"STRING"}
                value={variable.value}
                placeHolder={"Enter variable value"}
                length={200}
                onValueChange={(val) => {
                  dispatch(updateGlobalVariable({ index, value: val }));
                }}
              />
              {!isPrefetched && (
                <Close
                  onClick={() => handleDelete(index)}
                  className={styles.close}
                />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400">
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
