import { useSelector } from "react-redux";
import { InputTypes, Task } from "../../../types";
import CustomInput from "../../Inputs/CustomInput";
import { notificationOptions } from "./utils";
import { currentPlaybookSelector } from "../../../store/features/playbook/selectors";
import { getAssetsFunction } from "../../../utils/fetchAssetModelOptions";
import { useEffect } from "react";
import { commonKeySelector } from "../../../store/features/common/selectors";
import { updateCardById } from "../../../utils/execution/updateCardById";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask";

const connectorKey = "task_connector_sources.0.id";

function AddNotification() {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement?.tasks ?? [];
  const notificationTask: Task = tasks[1];
  const { connectorOptions } = useSelector(commonKeySelector);
  const [, , , data] = useCurrentTask(notificationTask?.id);

  useEffect(() => {
    if (!notificationTask?.id || !notificationTask?.source) return;
    getAssetsFunction(notificationTask.id);
  }, [notificationTask?.source]);

  if (!notificationTask || connectorOptions?.length === 0) return;

  const handleChannelsChange = (val: string) => {
    const source = notificationTask?.source ?? "";
    const taskType = notificationTask?.[source?.toLowerCase()]?.type ?? "";
    const taskKey = `${[source.toLowerCase()]}.${[
      taskType.toLowerCase(),
    ]}.channel`;
    updateCardById(taskKey, val, notificationTask.id);
  };

  const handleMessageChange = (val: string) => {
    const source = notificationTask?.source ?? "";
    const taskType = notificationTask?.[source?.toLowerCase()]?.type ?? "";
    const taskKey = `${[source.toLowerCase()]}.${[
      taskType.toLowerCase(),
    ]}.message`;
    updateCardById(taskKey, val, notificationTask.id);
  };

  const handleSourceChange = (val: string) => {
    const currentConnectorOptions =
      connectorOptions?.find((e) => e.id === "SLACK")?.connector
        ?.connector_options ?? [];
    const id = currentConnectorOptions?.[0]?.connector_id;
    updateCardById(connectorKey, id, notificationTask.id);
    updateCardById("source", val, notificationTask.id);
  };

  const assets =
    notificationTask?.ui_requirement?.assets?.map((e) => ({
      id: e.channel_id,
      label: e.channel_name,
    })) ?? [];

  return (
    <div className="flex flex-col gap-1 border p-2 rounded">
      <p className="font-bold text-violet-500 text-sm">Notification</p>
      <div className="flex items-center gap-1">
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          options={notificationOptions}
          value={notificationTask.source}
          placeholder={`Select Source`}
          handleChange={handleSourceChange}
          error={undefined}
        />
        <CustomInput
          inputType={InputTypes.TYPING_DROPDOWN}
          options={assets}
          value={data?.channel}
          placeholder={`Select Channels`}
          handleChange={handleChannelsChange}
          error={undefined}
          helpText={assets?.find((e) => e.id === data?.channel)?.label}
        />
      </div>
      <CustomInput
        inputType={InputTypes.MULTILINE}
        options={assets}
        value={data?.message}
        placeholder={`Enter message to send to slack`}
        handleChange={handleMessageChange}
        error={undefined}
      />
    </div>
  );
}

export default AddNotification;
