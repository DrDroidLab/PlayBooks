/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useDeletePlaybookMutation } from "../../store/features/playbook/api/index.ts";
import Overlay from "../Overlay/index.jsx";
import styles from "./index.module.css";
import { CircularProgress } from "@mui/material";

const PlaybookActionOverlay = ({
  playbook,
  isOpen,
  toggleOverlay,
  refreshTable,
}) => {
  const [deletePlaybook, { isLoading, isSuccess, status }] =
    useDeletePlaybookMutation();
  const handleSuccess = () => {
    deletePlaybook(playbook.id);
  };

  useEffect(() => {
    if (isSuccess) {
      toggleOverlay();
      refreshTable();
    }
  }, [status]);

  return (
    <>
      {isOpen && (
        <Overlay close={toggleOverlay} visible={isOpen}>
          <div className={styles["actionOverlay"]}>
            <header className="text-gray-500">Delete {playbook.name}?</header>
            <div className={styles.actions}>
              <button
                className={styles["submitButton"]}
                onClick={toggleOverlay}>
                Cancel
              </button>
              <button
                className={styles["submitButtonRight"]}
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

export default PlaybookActionOverlay;
