import { useEffect, useState } from "react";
import styles from "./index.module.css";
import Overlay from "../Overlay";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../store/features/playbook/playbookSlice.ts";
import ValueComponent from "../ValueComponent/index.jsx";
import Toast from "../Toast.js";

const SavePlaybookOverlay = ({ isOpen, close, saveCallback }) => {
  const { name: playbookName, isEditing } = useSelector(playbookSelector);
  const [name, setName] = useState(playbookName);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = () => {
    if (!name && !playbookName) {
      setValidationError("Please enter a name");
      return;
    }
    saveCallback({
      pbName: name || playbookName,
    });
    close();
  };

  useEffect(() => {
    setName(playbookName);
  }, [playbookName]);

  return (
    <div style={{ zIndex: "200" }}>
      <Overlay visible={isOpen}>
        <div className={styles["dashboardSaveOverlay"]}>
          <div
            style={!isEditing ? { gap: "10px" } : {}}
            className={styles["dashboardSaveOverlay__content"]}>
            <div className={styles["panel__description"]}>
              {isEditing
                ? `Update "${playbookName}" playbook? `
                : playbookName
                ? `Save this playbook as "${playbookName}"?`
                : "Please Enter a name"}
            </div>
            <div className={styles["panel__description"]}>
              {isEditing && "NOTE: This action is irreversible"}
            </div>
            {!isEditing && !playbookName && (
              <div>
                <ValueComponent
                  valueType={"STRING"}
                  onValueChange={(val) => setName(val)}
                  value={name}
                  placeHolder={"Enter Playbook name"}
                  length={300}
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
