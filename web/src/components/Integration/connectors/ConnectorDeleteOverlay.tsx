/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import Overlay from "../../Overlay/index.jsx";
import styles from "./overlay.module.css";
import { CircularProgress } from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import { useDeleteConnectorMutation } from "../../../store/features/integrations/api/index.ts";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../common/CustomButton/index.tsx";
import AffectedPlaybooks from "../../AffectedPlaybooks/index.tsx";

const ConnectorDeleteOverlay = ({
  isOpen,
  successCb,
  toggleOverlay,
  connector,
}) => {
  const navigate = useNavigate();
  const [deleteConnector, { isLoading, isSuccess }] =
    useDeleteConnectorMutation();

  const handleSuccess = (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConnector(connector.id);
    navigate("/data-sources", { replace: true });
  };

  useEffect(() => {
    if (isSuccess) {
      successCb();
    }
  }, [isSuccess]);

  return (
    <>
      {isOpen && (
        <Overlay close={toggleOverlay} visible={isOpen}>
          <div className={styles["actionOverlay"]}>
            <div className="flex justify-between items-center">
              <header className="text-gray-500">
                Delete {connector?.display_name ?? connector?.title} keys?
              </header>
              <CloseRounded
                onClick={toggleOverlay}
                className="text-gray-500 cursor-pointer"
              />
            </div>
            <p className="text-gray-500 text-sm">This action is permanent.</p>
            <AffectedPlaybooks id={connector.id} />
            <div className={styles.actions}>
              <CustomButton onClick={handleSuccess}>Yes</CustomButton>
              <CustomButton onClick={toggleOverlay}>No</CustomButton>
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
