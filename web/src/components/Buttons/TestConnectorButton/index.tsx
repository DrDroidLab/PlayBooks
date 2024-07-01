import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { useDispatch, useSelector } from "react-redux";
import { connectorSelector } from "../../../store/features/integrations/integrationsSlice.ts";
import { useLazyTestConnectionQuery } from "../../../store/features/integrations/api/testConnectionApi.ts";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice.ts";

function TestConnectorButton({ id, connector, formData }) {
  const dispatch = useDispatch();
  const currentConnector = useSelector(connectorSelector);
  const [triggerTestConnection, { isFetching: testConnectionLoading }] =
    useLazyTestConnectionQuery();
  const keyOptions = connector?.keys ?? [];

  const handleClick = async () => {
    const formattedKeys: any = [];
    const error = keyOptions.findIndex((op) => {
      return formData[op.key_type] === "";
    });
    if (error !== -1) {
      dispatch(showSnackbar("Please fill all the required fields."));
      return;
    }
    keyOptions?.forEach((e) => {
      formattedKeys.push({
        key_type: e.key_type,
        key: (formData[e.key_type] === "SSL_VERIFY"
          ? formData[e.key_type] !== ""
            ? formData[e.key_type]
            : false
          : formData[e.key_type]
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
