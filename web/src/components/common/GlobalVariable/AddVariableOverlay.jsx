import React, { useState } from "react";
import styles from "./styles.module.css";
// import ValueComponent from '../ValueComponent';
import { useDispatch, useSelector } from "react-redux";
import Overlay from "../../Overlay/index.jsx";
import {
  addGlobalVariable,
  playbookSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { CloseRounded } from "@mui/icons-material";
import Toast from "../../Toast.js";
import CustomButton from "../CustomButton/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

const AddVariableOverlay = ({ isOpen, close }) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");
  const dispatch = useDispatch();
  const { globalVariables } = useSelector(playbookSelector);

  const resetState = () => {
    setName("");
    setValue("");
    setValidationError("");
  };

  const handleSubmit = () => {
    if (!(name && value)) {
      setValidationError("Please enter all fields");
      return;
    }
    const nameVal = !name.startsWith("$") ? `$${name}` : name;
    if (globalVariables?.find((e) => e.name === nameVal)) {
      setValidationError("A variable with this name already exists");
      return;
    }
    dispatch(addGlobalVariable({ name: nameVal, value: value }));
    close();
    resetState();
  };

  return (
    <div style={{ zIndex: "200" }}>
      <Overlay close={close} visible={isOpen}>
        <div className={styles["dashboardSaveOverlay"]}>
          <div className={styles["dashboardSaveOverlay__content"]}>
            <div className={styles.title}>
              Add a new variable
              <CloseRounded onClick={() => close()} />
            </div>
          </div>
          <div className={styles.variable}>
            <CustomInput
              inputType={InputTypes.TEXT}
              handleChange={(val) => setName(val)}
              value={name}
              placeholder={"Enter variable name"}
            />
            <CustomInput
              inputType={InputTypes.TEXT}
              handleChange={(val) => setValue(val)}
              value={value}
              placeholder={"Enter variable value"}
            />
          </div>
          <div className="flex items-center gap-2 mt-10">
            <CustomButton onClick={() => close()}>Cancel</CustomButton>
            <CustomButton onClick={handleSubmit}>Add</CustomButton>
          </div>
        </div>
        <Toast
          open={validationError}
          severity="error"
          message={validationError}
          handleClose={() => setValidationError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        />
      </Overlay>
    </div>
  );
};

export default AddVariableOverlay;
