/* eslint-disable react-hooks/exhaustive-deps */
import { usePlaybookBuilderOptionsQuery } from "../../../store/features/playbook/api/index.ts";
import SelectComponent from "../../SelectComponent/index.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";
import { CircularProgress } from "@mui/material";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function SelectInterpreterDropdown({ index }) {
  const { data, isFetching } = usePlaybookBuilderOptionsQuery();
  const [step, currentIndex] = useCurrentStep(index);
  const isPrefetched = useIsPrefetched();

  const handleInterpreterChange = (value) => {
    updateCardByIndex("interpreter", value?.interpreter, currentIndex);
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
      <SelectComponent
        data={data?.interpreterTypes?.map((interpreter) => ({
          id: interpreter.type,
          label: interpreter.display_name,
          interpreter,
        }))}
        placeholder="Select Insights Source"
        onSelectionChange={(_, value) => handleInterpreterChange(value)}
        selected={step?.interpreter?.type ?? ""}
        searchable={true}
        disabled={isPrefetched}
      />
    </div>
  );
}

export default SelectInterpreterDropdown;
