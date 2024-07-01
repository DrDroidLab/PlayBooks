import React, { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { useCreateConnectorMutation } from "../../../store/features/integrations/api/index.ts";
import { useSelector } from "react-redux";
import { connectorSelector } from "../../../store/features/integrations/integrationsSlice.ts";
import { useNavigate } from "react-router-dom";
import ConnectorUpdateOverlay from "../../Integration/connectors/ConnectorUpdateOverlay";

function UpdateConnectorButton({ id, connector }) {
  const navigate = useNavigate();
  const [createConnector, { isLoading: saveLoading }] =
    useCreateConnectorMutation();
  const currentConnector = useSelector(connectorSelector);
  const connectorActive = id !== undefined && id !== null;
  const [isUpdating, setIsUpdating] = useState(false);
  const keyOptions = connector?.keys ?? [];

  const handleClick = async () => {
    if (connectorActive) {
      setIsUpdating(true);
    } else {
      const formattedKeys: any = [];
      keyOptions?.forEach((e) => {
        formattedKeys.push({
          key_type: e.key_type,
          key: (currentConnector[e.key_type] === "SSL_VERIFY"
            ? currentConnector[e.key_type] !== ""
              ? currentConnector[e.key_type]
              : false
            : currentConnector[e.key_type]
          )?.toString(),
        });
      });

      const res: any = await createConnector({
        type: connector.type,
        keys: formattedKeys,
        name: currentConnector.name,
      });
      if (res.data?.success) {
        navigate("/data-sources");
      }
    }
  };

  return (
    <>
      <CustomButton onClick={handleClick}>
        {connectorActive ? "Update" : saveLoading ? "Loading..." : "Save"}
      </CustomButton>
      <ConnectorUpdateOverlay
        isOpen={isUpdating}
        connector={{ ...connector, id }}
        toggleOverlay={() => setIsUpdating(!isUpdating)}
      />
    </>
  );
}

export default UpdateConnectorButton;
