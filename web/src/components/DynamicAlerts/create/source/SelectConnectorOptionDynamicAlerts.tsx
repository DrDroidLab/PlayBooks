import { useSelector } from "react-redux";
import { RefreshRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { DrawerTypes } from "../../../../store/features/drawers/drawerTypes.ts";
import { usePlaybookBuilderOptionsQuery } from "../../../../store/features/playbook/api/index.ts";
import useDrawerState from "../../../../hooks/common/useDrawerState.ts";
import CustomButton from "../../../common/CustomButton/index.tsx";
import AddDataSourcesDrawer from "../../../common/Drawers/AddDataSourcesDrawer.tsx";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";
import CustomInput from "../../../Inputs/CustomInput.tsx";
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

function SelectConnectorOptionDynamicAlerts() {
  const { connectorOptions } = useSelector(commonKeySelector);
  const { isFetching, refetch } = usePlaybookBuilderOptionsQuery();
  const { toggle } = useDrawerState(id);

  function handleConnectorOptionChange(id: string) {}

  const currentConnectorOptions =
    connectorOptions?.find((e) => e.id === "")?.connector?.connector_options ??
    [];

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
              value={""}
              handleChange={handleConnectorOptionChange}
              suffix={<RefreshButton refetch={refetch} loading={isFetching} />}
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

export default SelectConnectorOptionDynamicAlerts;
