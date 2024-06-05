/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import styles from "./overlay.module.css";
import { CircularProgress } from "@mui/material";
import { useUpdateConnectorMutation } from "../../../store/features/integrations/api/index.ts";
import Overlay from "../../Overlay/index.jsx";
import { CloseRounded } from "@mui/icons-material";
import HandleKeyOptions from "./HandleKeyOptions.jsx";
import { useNavigate } from "react-router-dom";

const ConnectorUpdateOverlay = ({ isOpen, toggleOverlay, connector }) => {
  const naviagte = useNavigate();
  const [updateConnector, { isLoading }] = useUpdateConnectorMutation();
  const [formData, setFormData] = useState({});
  const handleSuccess = async () => {
    const formattedKeys = [];
    for (let [key, val] of Object.entries(formData)) {
      formattedKeys.push({
        key_type: key,
        key: val,
      });
    }

    await updateConnector({
      id: connector.id,
      keys: formattedKeys,
    });

    naviagte("/data-sources");
  };

  useEffect(() => {
    if (connector.keys && connector.keys.length > 0) {
      const obj = {};
      connector.keys.forEach((e) => {
        obj[e.key_type] = "";
      });
      setFormData(obj);
    }
  }, [connector.keys]);

  return (
    <>
      {isOpen && (
        <Overlay close={toggleOverlay} visible={isOpen}>
          <div className={styles["actionOverlay"]}>
            <div className="flex items-center justify-between">
              <header className="text-gray-500">
                Update {connector?.display_name} Keys
              </header>
              <CloseRounded
                onClick={toggleOverlay}
                className="text-gray-500 cursor-pointer"
              />
            </div>
            {connector.keys?.map((option, i) => (
              <div
                key={i}
                style={{ margin: "5px 0" }}
                className={styles["eventTypeSelectionSection"]}>
                <div
                  className={styles["content"]}
                  style={{ fontSize: "12px", marginLeft: "2px" }}>
                  {option.display_name}
                </div>
                <HandleKeyOptions
                  connectorActive={false}
                  option={option}
                  onValueChange={(val) => {
                    setFormData((prev) => {
                      return {
                        ...prev,
                        [option.key_type]: val,
                      };
                    });
                  }}
                  value={formData[option.key_type]}
                />
              </div>
            ))}
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
