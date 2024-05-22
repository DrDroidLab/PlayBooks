import React, { useState } from "react";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import SelectComponent from "../../SelectComponent";
import { RefreshRounded } from "@mui/icons-material";
import { useGetBuilderOptionsQuery } from "../../../store/features/playbook/api/index.ts";
import { CircularProgress } from "@mui/material";
import CustomDrawer from "../../common/CustomDrawer";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";

function SelectConnectorOption() {
  const { currentStepIndex, steps, connectorOptions } =
    useSelector(playbookSelector);
  const step = steps[currentStepIndex];
  const isPrefetched = useIsPrefetched();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { isFetching, refetch } = useGetBuilderOptionsQuery();

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  function handleConnectorOptionChange(id) {
    updateCardByIndex("connectorType", id);
  }

  const currentConnectorOptions =
    connectorOptions?.find((e) => e.id === step?.source)?.connector
      ?.connector_options ?? [];

  return (
    <>
      {currentConnectorOptions.length > 0 ? (
        <div className="flex gap-2">
          <SelectComponent
            data={currentConnectorOptions.map((option) => ({
              id: option.connector_id,
              label: option.display_name,
              option: option,
            }))}
            placeholder="Select Connector"
            onSelectionChange={handleConnectorOptionChange}
            selected={step?.connectorType}
            searchable={true}
            disabled={isPrefetched}
          />
        </div>
      ) : (
        <>
          <button
            href="/playbooks/create"
            rel="noreferrer"
            target="_blank"
            onClick={toggleDrawer}
            className="border border-violet-500 p-1 rounded text-violet-500 hover:bg-violet-500 hover:text-white transition-all text-xs">
            + Add New Source
          </button>
        </>
      )}
      {!isPrefetched && (
        <button onClick={refetch}>
          <RefreshRounded
            className={`text-gray-400 hover:text-gray-600 transition-all`}
          />
        </button>
      )}
      {isFetching && <CircularProgress size={20} />}
      <CustomDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setDrawerOpen}
        src={"/integrations"}
      />
    </>
  );
}

export default SelectConnectorOption;
