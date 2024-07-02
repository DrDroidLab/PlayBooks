import { useEffect, useState } from "react";
import styles from "./index.module.css";
import Overlay from "../Overlay";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setPlaybookKey,
} from "../../store/features/playbook/playbookSlice.ts";
import ValueComponent from "../ValueComponent/index.jsx";
import Toast from "../Toast.js";

const SavePlaybookOverlay = ({ isOpen, close, saveCallback }) => {
  const {
    name: playbookName,
    isEditing,
    description: playbookDescription,
  } = useSelector(playbookSelector);
  const dispatch = useDispatch();
  const [name, setName] = useState(playbookName);
  const [description, setDescription] = useState(playbookDescription);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = () => {
    if (!name && !playbookName) {
      setValidationError("Please enter a name");
      return;
    }
    dispatch(setPlaybookKey({ key: "description", value: description }));
    dispatch(setPlaybookKey({ key: "name", value: name }));
    saveCallback({
      pbName: name || playbookName,
      description,
    });
    close();
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);
  };

  useEffect(() => {
    setName(playbookName);
  }, [playbookName]);

  return (
    <div style={{ zIndex: "200" }}>
      <Overlay close={close} visible={isOpen}>
        <div className={styles["dashboardSaveOverlay"]}>
          <div
            style={!isEditing ? { gap: "10px" } : {}}
            className={styles["dashboardSaveOverlay__content"]}>
            <div className={styles["panel__description"]}>
              {isEditing
                ? `Update "${playbookName}" playbook? `
                : playbookName
                ? `Save this playbook as "${playbookName}"?`
                : "Please enter a name"}
            </div>
            <div className={styles["panel__description"]}>
              {isEditing && "NOTE: This action is irreversible"}
            </div>
            {!isEditing && !playbookName && (
              <div>
                <label className="text-xs font-bold text-gray-500">Name</label>
                <ValueComponent
                  valueType={"STRING"}
                  onValueChange={(val) => setName(val)}
                  value={name}
                  placeHolder={"Enter Playbook name"}
                  length={300}
                />
              </div>
            )}
            {!isEditing && !playbookDescription && (
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
            <button className={styles["submitButton"]} onClick={() => close()}>
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
