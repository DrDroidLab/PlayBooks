/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import styles from "./overlay.module.css";
import { CircularProgress } from "@mui/material";
import { useUpdateConnectorMutation } from "../../../store/features/integrations/api/index.ts";
import { useSelector } from "react-redux";
import {
  agentProxySelector,
  connectorSelector,
  keyOptionsSelector,
} from "../../../store/features/integrations/integrationsSlice.ts";
import ValueComponent from "../../ValueComponent/index.jsx";
import Overlay from "../../Overlay/index.jsx";
import { CloseRounded } from "@mui/icons-material";

const ConnectorUpdateOverlay = ({ isOpen, toggleOverlay }) => {
  const [updateConnector, { isLoading }] = useUpdateConnectorMutation();
  const [formData, setFormData] = useState({});
  const keyOptions = useSelector(keyOptionsSelector);
  const agentProxy = useSelector(agentProxySelector);
  const currentConnector = useSelector(connectorSelector);
  const vpcEnabled = currentConnector?.vpc?.status === "active";
  const handleSuccess = async () => {
    const formattedKeys = [];
    for (let [key, val] of Object.entries(formData)) {
      formattedKeys.push({
        key_type: key,
        key: val,
      });
    }

    await updateConnector({
      id: vpcEnabled ? currentConnector?.vpc?.id : currentConnector.id,
      keys: formattedKeys,
    });

    window.location.reload();
  };

  useEffect(() => {
    if (vpcEnabled) {
      if (agentProxy?.keyOptions && agentProxy?.keyOptions?.length > 0) {
        const obj = {};
        keyOptions.forEach((e) => {
          obj[e.key_type] = "";
        });
        setFormData(obj);
      }
    } else {
      if (keyOptions && keyOptions.length > 0) {
        const obj = {};
        keyOptions.forEach((e) => {
          obj[e.key_type] = "";
        });
        setFormData(obj);
      }
    }
  }, [keyOptions]);

  return (
    <>
      {isOpen && (
        <Overlay visible={isOpen}>
          <div className={styles["actionOverlay"]}>
            <div className="flex items-center justify-between">
              <header className="text-gray-500">
                Update{" "}
                {vpcEnabled ? "Agent Proxy" : currentConnector?.displayTitle}{" "}
                Keys
              </header>
              <CloseRounded
                onClick={toggleOverlay}
                className="text-gray-500 cursor-pointer"
              />
            </div>
            {(vpcEnabled ? agentProxy?.keyOptions : keyOptions)?.map(
              (option, i) => (
                <div
                  key={i}
                  style={{ margin: "5px 0" }}
                  className={styles["eventTypeSelectionSection"]}>
                  <div
                    className={styles["content"]}
                    style={{ fontSize: "12px", marginLeft: "2px" }}>
                    {option.display_name}
                  </div>
                  <ValueComponent
                    valueType={"STRING"}
                    onValueChange={(val) => {
                      setFormData((prev) => {
                        return {
                          ...prev,
                          [option.key_type]: val,
                        };
                      });
                    }}
                    value={formData[option.key_type]}
                    placeHolder={option.display_name}
                    length={500}
                  />
                </div>
              ),
            )}
            <div className={styles.actions}>
              <button
                className={styles["submitButton"]}
                onClick={toggleOverlay}>
                Cancel
              </button>
              <button
                className={styles["submitButtonRight"]}
                sx={{ marginLeft: "5px" }}
                onClick={handleSuccess}>
                Yes
              </button>
              {isLoading && (
                <CircularProgress
                  style={{
                    marginLeft: "12px",
                  }}
                  size={20}
                />
              )}
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
};

export default ConnectorUpdateOverlay;
