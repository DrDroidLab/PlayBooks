/* eslint-disable react-hooks/exhaustive-deps */
import { usePlaybookBuilderOptionsQuery } from "../../../store/features/playbook/api/index.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";
import { CircularProgress } from "@mui/material";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function SelectInterpreterDropdown({ id }) {
  const { data, isFetching } = usePlaybookBuilderOptionsQuery();
  const [step, currentId] = useCurrentStep(id);
  const isPrefetched = useIsPrefetched();

  const handleInterpreterChange = (value) => {
    updateCardById("interpreter", value?.interpreter, currentId);
  };

  return (
    <div className="relative flex my-2">
      {isFetching && (
        <CircularProgress
          style={{
            marginRight: "12px",
          }}
          size={20}
        />
      )}
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        options={data?.interpreterTypes?.map((interpreter) => ({
          id: interpreter.type,
          label: interpreter.display_name,
          interpreter,
        }))}
        placeholder="Select Insights Source"
        handleChange={(_, value) => handleInterpreterChange(value)}
        value={step?.interpreter?.type ?? ""}
        searchable={true}
        disabled={isPrefetched}
      />
    </div>
  );
}

export default SelectInterpreterDropdown;
