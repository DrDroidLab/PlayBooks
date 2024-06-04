/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import Overlay from "../../Overlay/index.jsx";
import styles from "./overlay.module.css";
import { CircularProgress } from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import { useDeleteConnectorMutation } from "../../../store/features/integrations/api/index.ts";

const ConnectorDeleteOverlay = ({
  isOpen,
  successCb,
  toggleOverlay,
  connector,
}) => {
  const [deleteConnector, { isLoading, isSuccess, data }] =
    useDeleteConnectorMutation();
  const handleSuccess = () => {
    deleteConnector(connector.id);
  };

  useEffect(() => {
    if (isSuccess) {
      successCb();
    }
  }, [data]);

  return (
    <>
      {isOpen && (
        <Overlay close={toggleOverlay} visible={isOpen}>
          <div className={styles["actionOverlay"]}>
            <div className="flex justify-between items-center">
              <header className="text-gray-500">
                Delete {connector?.display_name} keys?
              </header>
              <CloseRounded
                onClick={toggleOverlay}
                className="text-gray-500 cursor-pointer"
              />
            </div>
            <p className="text-gray-500 text-sm">This action is permanent.</p>
            <div className={styles.actions}>
              <button
                className={styles["submitButton"]}
                sx={{ marginRight: "10px" }}
                onClick={handleSuccess}>
                Yes
              </button>
              <button
                className={styles["submitButtonRight"]}
                onClick={toggleOverlay}>
                No
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

export default ConnectorDeleteOverlay;
