import styles from "./index.module.css";
import ConnectorUpdateOverlay from "./ConnectorUpdateOverlay";
import ConnectorDeleteOverlay from "./ConnectorDeleteOverlay";
import { useState } from "react";
import { useCreateConnectorMutation } from "../../../store/features/integrations/api/index.ts";
import { useLazyTestConnectionQuery } from "../../../store/features/integrations/api/testConnectionApi.ts";
import SlackManifestGenerator from "./SlackManifestGenerator.jsx";
import HandleKeyOptions from "./HandleKeyOptions.jsx";

function Config({ connector, connectorActive }) {
  const keyOptions = connector?.keys ?? [];
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleClick = async (_, test = false) => {
    if (connectorActive) {
      setIsUpdating(true);
    } else {
      const formattedKeys = [];
      keyOptions?.forEach((e) => {
        formattedKeys.push({
          key_type: e.key_type,
          key: (connector[e.key_type] === "SSL_VERIFY"
            ? connector[e.key_type] !== ""
              ? connector[e.key_type]
              : false
            : connector[e.key_type]
          ).toString(),
        });
      });
      if (test) {
        await triggerTestConnection({
          type: connector.type,
          keys: formattedKeys,
        });
      } else {
        await createConnector({
          type: connector.type,
          keys: formattedKeys,
        });
        window.location.reload();
      }
    }
  };

  return (
    <>
      {connector.type === "SLACK" && <SlackManifestGenerator />}

      <div className={styles["container"]}>
        <div className={styles["heading"]}>
          <span>{connector?.display_name ?? connector?.type} Keys</span>
          {connector?.docs && (
            <span>
              (
              <a
                className="text-violet-500 cursor-pointer"
                href={connector.docs}
                target="_blank"
                rel="noreferrer">
                Docs
              </a>
              )
            </span>
          )}
        </div>

        {keyOptions?.map((option, i) => (
          <div
            key={i}
            className={`${styles["eventTypeSelectionSection"]} flex items-center`}>
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
