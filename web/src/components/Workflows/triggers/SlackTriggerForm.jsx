import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { useGetTriggerOptionsQuery } from "../../../store/features/triggers/api/getTriggerOptionsApi.ts";
import {
  handleTriggerInput,
  handleTriggerSelect,
} from "../utils/handleInputs.ts";
import { CircularProgress } from "@mui/material";
import { RefreshRounded } from "@mui/icons-material";
import AlertsDrawer from "../../common/Drawers/AlertsDrawer.jsx";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function SlackTriggerForm() {
  const { data: options, isFetching, refetch } = useGetTriggerOptionsQuery();
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const { toggle } = useDrawerState(DrawerTypes.ALERTS);

  const handleSubmit = () => {
    toggle();
  };
  const sources = options?.alert_types?.filter(
    (e) => e.channel_id === currentWorkflow.trigger?.channel?.channel_id,
  );

  return (
    <div className="flex flex-col gap-2 items-start bg-gray-50 rounded p-2">
      <div className="text-sm flex items-center gap-2">
        <p className="text-xs">Channel</p>
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          options={options?.active_channels?.map((e) => {
            return {
              id: e.channel_id,
              label: e.channel_name,
              channel: e,
            };
          })}
          placeholder="Select Channel"
          handleChange={(id) => {
            const channel = options?.active_channels.find(
              (e) => e.channel_id === id,
            );
            handleTriggerSelect("channel", channel);
          }}
          value={currentWorkflow?.trigger?.channel?.channel_id ?? ""}
          searchable={true}
          error={currentWorkflow?.errors?.channelId ?? false}
        />
        {isFetching && <CircularProgress size={20} />}
        <button onClick={refetch}>
          <RefreshRounded className="text-gray-400 text-md cursor-pointer hover:text-black" />
        </button>
      </div>
      <div className="text-sm flex items-center gap-2">
        <p className="text-xs">Bot</p>
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          options={sources?.map((e) => {
            return {
              id: e.alert_type,
              label: e.alert_type,
              source: e,
            };
          })}
          placeholder="Select Bot"
          handleChange={(id) => handleTriggerSelect("source", id)}
          value={currentWorkflow?.trigger?.source ?? ""}
          searchable={true}
          error={currentWorkflow?.errors?.source ?? false}
        />
      </div>
      <div className="text-sm flex items-center gap-2">
        <p className="text-xs shrink-0">Matching string</p>
        <CustomInput
          inputType={InputTypes.TEXT}
          handleChange={(val) => {
            handleTriggerInput("filterString", val);
          }}
          value={currentWorkflow?.trigger?.filterString}
          placeholder={"Enter Matching string"}
          length={300}
          error={currentWorkflow?.errors?.filterString ?? false}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="text-xs bg-transparent hover:bg-violet-500 p-1 border-violet-500 border hover:text-white text-violet-500 rounded transition-all">
        Search
      </button>
      <AlertsDrawer />
    </div>
  );
}

export default SlackTriggerForm;
