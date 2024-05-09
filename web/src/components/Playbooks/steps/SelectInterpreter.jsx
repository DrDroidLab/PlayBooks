import { useSelector } from "react-redux";
import { useGetBuilderOptionsQuery } from "../../../store/features/playbook/api/index.ts";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import SelectComponent from "../../SelectComponent";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";
import { CircularProgress } from "@mui/material";

function SelectInterpreter() {
  const { data, isFetching } = useGetBuilderOptionsQuery();
  const { steps, currentStepIndex } = useSelector(playbookSelector);
  const step = steps[currentStepIndex];
  const isPrefetched = useIsPrefetched();

  const handleInterpreterChange = (value) => {
    updateCardByIndex("interpreter", value.interpreter);
  };

  return (
    <div>
      {isFetching && (
        <CircularProgress
          style={{
            marginRight: "12px",
          }}
          size={20}
        />
      )}
      <SelectComponent
        data={data?.map((interpreter) => ({
          id: interpreter.type,
          label: interpreter.display_name,
          interpreter,
        }))}
        placeholder="Select Interpreter"
        onSelectionChange={(_, value) => handleInterpreterChange(value)}
        selected={step?.interpreter?.type ?? ""}
        searchable={true}
        disabled={isPrefetched}
      />
    </div>
  );
}

export default SelectInterpreter;
