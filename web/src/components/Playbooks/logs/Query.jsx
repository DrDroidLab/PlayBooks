/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import SelectComponent from "../../SelectComponent";
import PlaybookStep from "./PlaybookStep";
import styles from "../playbooks.module.css";
import {
  useGetConnectorTypesQuery,
  useLazyGetAssetModelOptionsQuery,
} from "../../../store/features/playbook/api/index.ts";
import { CircularProgress } from "@mui/material";

function Query({ step, index }) {
  const { data: connectorData, isFetching: connectorLoading } =
    useGetConnectorTypesQuery();
  const [triggerGetAssetModelOptions, { isFetching }] =
    useLazyGetAssetModelOptionsQuery();

  const fetchData = (val) => {
    triggerGetAssetModelOptions({
      connector_type: val?.connector_type || step.source,
      model_type: val?.model_type || step.modelType,
      stepIndex: index,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles["step-fields"]}>
      <div
        style={{
          display: "flex",
          marginTop: "5px",
          position: "relative",
        }}>
        <div className="flex items-center">
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
            selected={step.selectedSource}
            searchable={true}
            disabled={true}
          />
        </div>
      </div>

      {step.source && (
        <PlaybookStep card={step} index={index} assetsList={step.assets} />
      )}
    </div>
  );
}

export default Query;
