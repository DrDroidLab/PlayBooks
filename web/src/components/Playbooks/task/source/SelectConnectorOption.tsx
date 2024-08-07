import { useSelector } from "react-redux";
import { RefreshRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { updateCardById } from "../../../../utils/execution/updateCardById.ts";
import { DrawerTypes } from "../../../../store/features/drawers/drawerTypes.ts";
import { usePlaybookBuilderOptionsQuery } from "../../../../store/features/playbook/api/index.ts";
import useDrawerState from "../../../../hooks/common/useDrawerState.ts";
import { fetchData } from "../../../../utils/fetchAssetModelOptions.ts";
import CustomButton from "../../../common/CustomButton/index.tsx";
import AddDataSourcesDrawer from "../../../common/Drawers/AddDataSourcesDrawer";
import useIsPrefetched from "../../../../hooks/playbooks/useIsPrefetched.ts";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";
import CustomInput from "../../../Inputs/CustomInput.tsx";
import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask.ts";
import { commonKeySelector } from "../../../../store/features/common/commonSlice.ts";

const id = DrawerTypes.ADD_DATA_SOURCES;

const RefreshButton = ({ refetch, loading }) => {
  return (
    <>
      <button onClick={refetch}>
        <RefreshRounded
          className={`text-gray-400 hover:text-gray-600 transition-all`}
        />
      </button>
      {loading && <CircularProgress size={20} />}
    </>
  );
};

function SelectConnectorOption({ id: taskId }) {
  const { connectorOptions } = useSelector(commonKeySelector);
  const [task, currentTaskId] = useCurrentTask(taskId);
  const { isFetching, refetch } = usePlaybookBuilderOptionsQuery();
  const { toggle } = useDrawerState(id);
  const isPrefetched = useIsPrefetched();

  function handleConnectorOptionChange(id: string) {
    updateCardById("task_connector_sources.0.id", id, currentTaskId);
    if (!isPrefetched) fetchData({ id: currentTaskId });
  }

  const currentConnectorOptions =
    connectorOptions?.find((e) => e.id === task?.source)?.connector
      ?.connector_options ?? [];

  const loading = isFetching || task?.ui_requirement?.assetsLoading;

  return (
    <div className="relative flex flex-col">
      <div className="flex gap-1 items-center">
        {currentConnectorOptions.length > 0 ? (
          <div className="flex gap-2">
            <CustomInput
              label="Connector"
              options={currentConnectorOptions.map((option) => ({
                id: option.connector_id,
                label: option.display_name,
                option: option,
              }))}
              inputType={InputTypes.DROPDOWN}
              value={task?.task_connector_sources?.[0]?.id ?? ""}
              handleChange={handleConnectorOptionChange}
              disabled={!!isPrefetched}
              suffix={<RefreshButton refetch={refetch} loading={loading} />}
            />
          </div>
        ) : (
          <>
            <CustomButton onClick={toggle}>+ Add New Source</CustomButton>
          </>
        )}
        <AddDataSourcesDrawer />
      </div>
    </div>
  );
}

export default SelectConnectorOption;
