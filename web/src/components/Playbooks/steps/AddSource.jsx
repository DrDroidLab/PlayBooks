import { CircularProgress } from "@mui/material";
import SelectComponent from "../../SelectComponent";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  updateStep,
} from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

function AddSource({ step, isDataFetching }) {
  const dispatch = useDispatch();
  const { currentStepIndex, connectorOptions, steps } =
    useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();

  const taskTypes =
    connectorOptions.find((e) => e.id === steps[currentStepIndex]?.source)
      ?.connector?.supported_task_type_options ?? [];

  function handleSourceChange(id) {
    dispatch(
      updateStep({
        index: currentStepIndex,
        key: "source",
        value: id,
      }),
    );
  }

  function handleTaskTypeChange(id) {
    dispatch(
      updateStep({
        index: currentStepIndex,
        key: "taskType",
        value: id,
      }),
    );
  }

  return (
    <div
      style={{
        display: "flex",
        marginTop: "5px",
        position: "relative",
        gap: "5px",
      }}>
      <div className="flex items-center gap-2">
        {isDataFetching && (
          <CircularProgress
            style={{
              marginRight: "12px",
            }}
            size={20}
          />
        )}
        <SelectComponent
          data={connectorOptions}
          placeholder="Select Data Source"
          onSelectionChange={handleSourceChange}
          selected={step.source}
          searchable={true}
          disabled={isPrefetched}
        />
        {/* {!isPrefetched && (
          <button onClick={refetch}>
            <RefreshRounded
              className={`text-gray-400 hover:text-gray-600 transition-all`}
            />
          </button>
        )}
        {(!connectorData || connectorData?.length === 0) && (
          <button
            href="/playbooks/create"
            rel="noreferrer"
            target="_blank"
            onClick={toggleDrawer}
            className="border border-violet-500 p-1 rounded text-violet-500 hover:bg-violet-500 hover:text-white transition-all text-xs">
            + Add New Source
          </button>
        )} */}
      </div>
      <SelectComponent
        data={taskTypes.map((type) => ({
          id: type.task_type,
          label: type.display_name,
          type: type,
        }))}
        placeholder="Select Task Type"
        onSelectionChange={handleTaskTypeChange}
        selected={step.taskType}
        searchable={true}
        disabled={isPrefetched}
      />
    </div>
  );
}

export default AddSource;
