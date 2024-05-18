/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector } from "react-redux";
import { useGetBuilderOptionsQuery } from "../../../store/features/playbook/api/index.ts";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import SelectComponent from "../../SelectComponent/index.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";
import { CircularProgress } from "@mui/material";
import { useEffect } from "react";

function SelectInterpreterDropdown({ index }) {
  const { data, isFetching } = useGetBuilderOptionsQuery();
  const { steps, currentStepIndex } = useSelector(playbookSelector);
  const currentIndex = index ?? currentStepIndex;
  const step = steps[currentIndex];
  const isPrefetched = useIsPrefetched();

  const handleInterpreterChange = (value) => {
    updateCardByIndex("interpreter", value?.interpreter, currentIndex);
  };

  useEffect(() => {
    return () => {
      updateCardByIndex("interpreter", undefined, currentIndex);
    };
  }, []);

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
        data={data?.map((interpreter) => ({
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
