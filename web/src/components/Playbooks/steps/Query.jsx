/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import SelectComponent from "../../SelectComponent";
import PlaybookStep from "./PlaybookStep";
import styles from "../playbooks.module.css";
import {
  useGetConnectorTypesQuery,
  useLazyGetAssetModelOptionsQuery,
} from "../../../store/features/playbook/api/index.ts";
import { selectSourceAndModel } from "../../../store/features/playbook/playbookSlice.ts";
import { useDispatch } from "react-redux";
import { CircularProgress } from "@mui/material";
import { RefreshRounded } from "@mui/icons-material";
import CustomDrawer from "../../common/CustomDrawer/index.jsx";

function Query({ step, index }) {
  const {
    data: connectorData,
    isFetching: connectorLoading,
    refetch,
  } = useGetConnectorTypesQuery();
  const [triggerGetAssetModelOptions, { isFetching }] =
    useLazyGetAssetModelOptionsQuery();
  const dispatch = useDispatch();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const fetchData = (val) => {
    if (val.connector_type === "API") return;
    triggerGetAssetModelOptions({
      connector_type: val?.connector_type || step.source,
      model_type: val?.model_type || step.modelType,
      stepIndex: index,
    });
  };

  function handleSourceChange(key, val) {
    dispatch(
      selectSourceAndModel({
        index,
        source: val.connector_type,
        modelType: val.model_type,
        key,
      }),
    );

    fetchData(val);
  }

  useEffect(() => {
    if (step.isPrefetched) {
      fetchData();
    }
  }, [step.isPrefetched]);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className={styles["step-fields"]}>
      <div
        style={{
          display: "flex",
          marginTop: "5px",
          position: "relative",
        }}>
        <div className="flex items-center gap-2">
          {(isFetching || connectorLoading) && (
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
            disabled={step.isPrefetched && !step.isCopied && step.source}
          />
          <button onClick={refetch}>
            <RefreshRounded
              className={`text-gray-400 hover:text-gray-600 transition-all`}
            />
          </button>
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

      {step.source && (
        <PlaybookStep card={step} index={index} assetsList={step.assets} />
      )}
      <CustomDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setDrawerOpen}
        src={"/integrations"}
      />
    </div>
  );
}

export default Query;
