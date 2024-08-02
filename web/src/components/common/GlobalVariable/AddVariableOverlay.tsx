import { useState } from "react";
import styles from "./styles.module.css";
import { useDispatch, useSelector } from "react-redux";
import Overlay from "../../Overlay/index.js";
import {
  addGlobalVariable,
  currentPlaybookSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { CloseRounded } from "@mui/icons-material";
import { Toast } from "../../Toast.tsx";
import CustomButton from "../CustomButton/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

const AddVariableOverlay = ({ isOpen, close }) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");
  const dispatch = useDispatch();
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const globalVariables = currentPlaybook?.global_variable_set ?? {};

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
    if (Object.keys(globalVariables)?.find((e) => e === nameVal)) {
      setValidationError("A variable with this name already exists");
      return;
    }
    dispatch(addGlobalVariable({ name: nameVal, value: value }));
    close();
    resetState();
  };

  return (
    <Overlay close={close} visible={isOpen}>
      <div className="z-[200] bg-white max-w-sm rounded m-2">
        <div className={"p-4"}>
          <div className={styles.title}>
            Add a new variable
            <CloseRounded onClick={() => close()} />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
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
          <p className="text-xs mt-2 text-gray-500 italic">
            To enter an array variable, just enter the values with commas
          </p>
          <div className="flex items-center gap-2 mt-10">
            <CustomButton onClick={() => close()}>Cancel</CustomButton>
            <CustomButton onClick={handleSubmit}>Add</CustomButton>
          </div>
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
  );
};

export default AddVariableOverlay;
