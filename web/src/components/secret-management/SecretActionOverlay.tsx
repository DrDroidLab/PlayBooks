/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import styles from "./index.module.css";
import { CircularProgress } from "@mui/material";
import Overlay from "../Overlay/index.js";
import CustomButton from "../common/CustomButton/index.tsx";
import { useDeleteSecretMutation } from "../../store/features/secrets/api/deleteSecretApi.ts";

const SecretActionOverlay = ({
  secret,
  isOpen,
  toggleOverlay,
  refreshTable,
}: any) => {
  const [deleteVariable, { isLoading, isSuccess, status }] =
    useDeleteSecretMutation();
  const handleSuccess = () => {
    deleteVariable({ id: secret.id });
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
        <Overlay visible={isOpen}>
          <div className={`${styles["actionOverlay"]} dark:bg-gray-900`}>
            <header className="text-gray-500 dark:text-gray-400">
              Delete {secret.name}?
            </header>
            <div className={"flex items-center gap-2 mt-4"}>
              <CustomButton onClick={toggleOverlay}>Cancel</CustomButton>
              <CustomButton onClick={handleSuccess}>Yes</CustomButton>
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

export default SecretActionOverlay;
