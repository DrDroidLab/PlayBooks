import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { addGlobalVariable } from "../../../store/features/workflow/workflowSlice.ts";
import Overlay from "../../Overlay";
import { Close } from "@mui/icons-material";
import ValueComponent from "../../ValueComponent";
import Toast from "../../Toast";
import CustomButton from "../../common/CustomButton/index.tsx";

const AddWorkflowVariableOverlay = ({ isOpen, close }) => {
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
    <div className="z-[200]">
      <Overlay close={close} visible={isOpen}>
        <div className="bg-white w-full p-4 rounded">
          <div className="mb-2">
            <div className="flex justify-between items-center text-base">
              Add a new variable
              <Close onClick={() => close()} />
            </div>
          </div>
          <div className={"flex flex-col gap-3"}>
            <ValueComponent
              valueType={"STRING"}
              onValueChange={(val) => setName(val)}
              value={name}
              placeHolder={"Enter variable name"}
              length={100}
            />
            <ValueComponent
              valueType={"STRING"}
              onValueChange={(val) => setValue(val)}
              value={value}
              placeHolder={"Enter variable value"}
              length={100}
            />
          </div>
          <div className="mt-3 flex gap-2">
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

export default AddWorkflowVariableOverlay;
