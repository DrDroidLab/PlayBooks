import { CircularProgress } from "@mui/material";
import React, { useState } from "react";
import SelectComponent from "../../SelectComponent";
import { useGetConnectorTypesQuery } from "../../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  selectSourceAndModel,
} from "../../../store/features/playbook/playbookSlice.ts";
import { RefreshRounded } from "@mui/icons-material";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

function AddSource({ step, isDataFetching }) {
  const {
    data: connectorData,
    isFetching: connectorLoading,
    refetch,
  } = useGetConnectorTypesQuery();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const { currentStepIndex } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  function handleSourceChange(key, val) {
    dispatch(
      selectSourceAndModel({
        index: currentStepIndex,
        source: val.connector_type,
        modelType: val.model_type,
        key,
      }),
    );
  }

  return (
    <div
      style={{
        display: "flex",
        marginTop: "5px",
        position: "relative",
      }}>
      <div className="flex items-center gap-2">
        {(isDataFetching || connectorLoading) && (
          <CircularProgress
            style={{
              marginRight: "12px",
            }}
            size={20}
          />
        )}
        <SelectComponent
          data={connectorData}
          placeholder="Select Data Source"
          onSelectionChange={(key, value) => handleSourceChange(key, value)}
          selected={step.selectedSource}
          searchable={true}
          disabled={isPrefetched}
        />
        {!isPrefetched && (
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
        )}
      </div>
    </div>
  );
}

export default AddSource;
