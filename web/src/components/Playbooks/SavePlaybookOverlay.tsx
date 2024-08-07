import { useEffect, useState } from "react";
import styles from "./index.module.css";
import Overlay from "../Overlay/index.js";
import { useDispatch, useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  setCurrentPlaybookKey,
} from "../../store/features/playbook/playbookSlice.ts";
import { Toast } from "../Toast.tsx";
import useIsExisting from "../../hooks/playbooks/useIsExisting.ts";
import CustomInput from "../Inputs/CustomInput.tsx";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

const SavePlaybookOverlay = ({ isOpen, close, saveCallback }) => {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const dispatch = useDispatch();
  const [name, setName] = useState(currentPlaybook?.name);
  const [description, setDescription] = useState(currentPlaybook?.description);
  const [validationError, setValidationError] = useState("");
  const isExisting = useIsExisting();

  const handleSubmit = () => {
    if (!name && !currentPlaybook?.name) {
      setValidationError("Please enter a name");
      return;
    }
    dispatch(setCurrentPlaybookKey({ key: "description", value: description }));
    dispatch(setCurrentPlaybookKey({ key: "name", value: name }));
    saveCallback();
    close();
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);
  };

  const handleClose = () => {
    dispatch(setCurrentPlaybookKey({ key: "description", value: description }));
    dispatch(setCurrentPlaybookKey({ key: "name", value: name }));
    close();
  };

  useEffect(() => {
    setName(currentPlaybook?.name);
  }, [currentPlaybook?.name]);

  return (
    <div style={{ zIndex: "200" }}>
      <Overlay close={handleClose} visible={isOpen}>
        <div className={styles["dashboardSaveOverlay"]}>
          <div
            style={!isExisting ? { gap: "10px" } : {}}
            className={styles["dashboardSaveOverlay__content"]}>
            <div className={styles["panel__description"]}>
              {isExisting
                ? `Update "${currentPlaybook?.name}" playbook? `
                : currentPlaybook?.name
                ? `Save this playbook as "${currentPlaybook?.name}"?`
                : "Please enter a name"}
            </div>
            <div className={styles["panel__description"]}>
              {isExisting && "NOTE: This action is irreversible"}
            </div>
            {!isExisting && !currentPlaybook?.name && (
              <div>
                <CustomInput
                  inputType={InputTypes.TEXT}
                  label="Name"
                  handleChange={(val) => setName(val)}
                  value={name}
                  placeholder={"Enter Playbook name"}
                  className="!w-[300px]"
                />
              </div>
            )}
            {!isExisting && !currentPlaybook?.description && (
              <div>
                <label className="text-xs font-bold text-gray-500">
                  Description
                </label>
                <textarea
                  className={
                    "w-full border border-gray-300 p-1 rounded text-xs resize-none text-[#676666] h-32"
                  }
                  placeholder="Add Playbook description"
                  value={description}
                  onChange={handleDescriptionChange}
                />
              </div>
            )}
          </div>
          <div className={styles["actions"]}>
            <button className={styles["submitButton"]} onClick={handleClose}>
              Cancel
            </button>

            <button
              className={styles["submitButton"]}
              onClick={handleSubmit}
              style={{
                marginLeft: "12px",
              }}>
              Save
            </button>
          </div>
        </div>
      </Overlay>
      <Toast
        open={!!validationError}
        severity="error"
        message={validationError}
        handleClose={() => setValidationError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </div>
  );
};

export default SavePlaybookOverlay;
