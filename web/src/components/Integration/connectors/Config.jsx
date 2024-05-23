import styles from "./index.module.css";
import ConnectorUpdateOverlay from "./ConnectorUpdateOverlay";
import ConnectorDeleteOverlay from "./ConnectorDeleteOverlay";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  agentProxySelector,
  connectorSelector,
} from "../../../store/features/integrations/integrationsSlice.ts";
import { useCreateConnectorMutation } from "../../../store/features/integrations/api/index.ts";
import { ToggleOff, ToggleOn } from "@mui/icons-material";
import AgentProxy from "./AgentProxy.jsx";
import { useLazyTestConnectionQuery } from "../../../store/features/integrations/api/testConnectionApi.ts";
import SlackManifestGenerator from "./SlackManifestGenerator.jsx";
import HandleKeyOptions from "./HandleKeyOptions.jsx";

function Config({ keyOptions }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentConnector = useSelector(connectorSelector);
  const [createConnector, { isLoading: saveLoading }] =
    useCreateConnectorMutation();
  const [
    triggerTestConnection,
    {
      currentData: testData,
      error: testError,
      isFetching: testConnectionLoading,
    },
  ] = useLazyTestConnectionQuery();
  const [vpcEnabled, setVpcEnabled] = useState(vpcEnabledCheck());
  const agentProxy = useSelector(agentProxySelector);
  const connectorActive =
    currentConnector.status === "active" ||
    currentConnector?.vpc?.status === "active";

  function vpcEnabledCheck() {
    if (currentConnector?.status === "active") {
      return false;
    } else if (currentConnector?.vpc?.status === "active") {
      return true;
    } else {
      return false;
    }
  }

  const handleClick = async (_, test = false) => {
    if (connectorActive) {
      setIsUpdating(true);
    } else {
      const formattedKeys = [];
      if (vpcEnabled) {
        agentProxy.keyOptions.forEach((e) => {
          formattedKeys.push({
            key_type: e.key_type,
            key: agentProxy[e.key_type],
          });
        });
      } else {
        keyOptions.forEach((e) => {
          formattedKeys.push({
            key_type: e.key_type,
            key: (currentConnector[e.key_type] === "SSL_VERIFY"
              ? currentConnector[e.key_type] !== ""
                ? currentConnector[e.key_type]
                : false
              : currentConnector[e.key_type]
            ).toString(),
          });
        });
      }
      if (test) {
        await triggerTestConnection({
          type: vpcEnabled ? currentConnector.vpc.enum : currentConnector.enum,
          keys: formattedKeys,
        });
      } else {
        await createConnector({
          type: vpcEnabled ? currentConnector.vpc.enum : currentConnector.enum,
          keys: formattedKeys,
        });
        window.location.reload();
      }
    }
  };

  const toggleVpc = () => {
    if (currentConnector?.vpc?.status === "active") {
      setVpcEnabled(true);
      return;
    } else if (currentConnector?.status === "active") {
      setVpcEnabled(false);
    } else {
      setVpcEnabled(!vpcEnabled);
    }
  };
  return (
    <>
      {currentConnector.vpc && (
        <div className={styles.vpcToggle} onClick={toggleVpc}>
          VPC Mode
          {vpcEnabled ? (
            <ToggleOn color="primary" fontSize="medium" />
          ) : (
            <ToggleOff color="disabled" fontSize="medium" />
          )}
        </div>
      )}

      {currentConnector.enum === "SLACK" && <SlackManifestGenerator />}

      {vpcEnabled ? (
        <AgentProxy />
      ) : (
        <div className={styles["container"]}>
          <div className={styles["heading"]}>
            <span>{currentConnector?.displayTitle} Keys</span>
            {currentConnector?.docs && (
              <span>
                (
                <a
                  className="text-violet-500 cursor-pointer"
                  href={currentConnector.docs}
                  target="_blank"
                  rel="noreferrer">
                  Docs
                </a>
                )
              </span>
            )}
          </div>

          {keyOptions?.map((option, i) => (
            <div key={i} className={styles["eventTypeSelectionSection"]}>
              <div className={styles["content"]}>
                {option?.display_name || option?.key_type}
              </div>
              <HandleKeyOptions
                connectorActive={connectorActive}
                option={option}
              />
            </div>
          ))}
        </div>
      )}

      <button
        className="text-xs bg-white hover:text-white hover:bg-violet-500 hover:color-white-500 py-1 px-1 border border-gray-400 rounded shadow"
        onClick={handleClick}
        style={{
          marginBottom: "12px",
        }}>
        {connectorActive ? "Update" : saveLoading ? "Loading..." : "Save"}
      </button>

      {connectorActive && (
        <button
          className="text-xs bg-white hover:text-white hover:bg-violet-500 hover:color-white-500 py-1 px-1 border border-gray-400 rounded shadow"
          onClick={async () => {
            setIsDeleting(true);
          }}
          style={{
            marginLeft: "12px",
            marginBottom: "12px",
          }}>
          Delete
        </button>
      )}

      {!connectorActive && (
        <button
          className="text-xs bg-white hover:text-white hover:bg-violet-500 hover:color-white-500 py-1 px-1 border border-gray-400 rounded shadow"
          onClick={(e) => handleClick(e, true)}
          style={{
            marginLeft: "12px",
            marginBottom: "12px",
          }}
          disabled={testConnectionLoading}>
          {testConnectionLoading ? "Checking connection..." : "Test Connection"}
        </button>
      )}

      {(testData?.message || testError) && !testConnectionLoading && (
        <p style={testError ? { color: "red" } : {}} className="text-xs">
          {testData?.message?.title ||
            testError?.message ||
            testError?.toString()}
        </p>
      )}

      <ConnectorUpdateOverlay
        isOpen={isUpdating}
        toggleOverlay={() => setIsUpdating(!isUpdating)}
        saveCallback={() => {}}
      />
      <ConnectorDeleteOverlay
        isOpen={isDeleting}
        toggleOverlay={() => setIsDeleting(!isDeleting)}
        successCb={() => {
          window.location.href = "/integrations";
        }}
      />
    </>
  );
}

export default Config;
