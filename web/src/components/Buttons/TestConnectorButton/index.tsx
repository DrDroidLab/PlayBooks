import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { useSelector } from "react-redux";
import { connectorSelector } from "../../../store/features/integrations/integrationsSlice.ts";
import { useLazyTestConnectionQuery } from "../../../store/features/integrations/api/testConnectionApi.ts";

function TestConnectorButton({ id, connector }) {
  const currentConnector = useSelector(connectorSelector);
  const [triggerTestConnection, { isFetching: testConnectionLoading }] =
    useLazyTestConnectionQuery();
  const keyOptions = connector?.keys ?? [];

  const handleClick = async () => {
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

    await triggerTestConnection({
      type: connector.type,
      keys: formattedKeys,
      name: currentConnector.name,
      id: id,
    });
  };

  return (
    <>
      <CustomButton onClick={handleClick}>
        {testConnectionLoading ? "Checking connection..." : "Test Connection"}
      </CustomButton>
    </>
  );
}

export default TestConnectorButton;
