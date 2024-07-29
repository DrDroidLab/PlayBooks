/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import styles from "./overlay.module.css";
import { CircularProgress } from "@mui/material";
import { useUpdateConnectorMutation } from "../../../store/features/integrations/api/index.ts";
import Overlay from "../../Overlay/index.jsx";
import { CloseRounded } from "@mui/icons-material";
import HandleKeyOptions from "./HandleKeyOptions.js";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../common/CustomButton/index.tsx";
import TestConnectorButton from "../../Buttons/TestConnectorButton/index.tsx";
import ShowTestConnectorResult from "../../ShowTestConnectorResult/index.tsx";
import AffectedPlaybooks from "../../AffectedPlaybooks/index.tsx";

const ConnectorUpdateOverlay = ({ isOpen, toggleOverlay, connector }) => {
  const naviagte = useNavigate();
  const [updateConnector, { isLoading }] = useUpdateConnectorMutation();
  const [formData, setFormData] = useState({});
  const handleSuccess = async () => {
    const formattedKeys: any = [];
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
            <AffectedPlaybooks id={connector.id} />
            <div className={styles.actions}>
              <CustomButton onClick={toggleOverlay}>Cancel</CustomButton>
              <CustomButton onClick={handleSuccess}>Update</CustomButton>
              <TestConnectorButton
                id={connector.id}
                connector={connector}
                formData={formData}
              />
              {isLoading && (
                <CircularProgress
                  style={{
                    marginLeft: "12px",
                  }}
                  size={20}
                />
              )}
            </div>
            <ShowTestConnectorResult />
          </div>
        </Overlay>
      )}
    </>
  );
};

export default ConnectorUpdateOverlay;
