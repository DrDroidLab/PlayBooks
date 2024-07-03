import React from "react";
import { useParams } from "react-router-dom";
import UpdateConnectorButton from "../../Buttons/UpdateConnectorButton/index.tsx";
import DeleteConnectorButton from "../../Buttons/DeleteConnectorButton/index.tsx";
import TestConnectorButton from "../../Buttons/TestConnectorButton/index.tsx";
import ShowTestConnectorResult from "../../ShowTestConnectorResult/index.tsx";
import { useSelector } from "react-redux";
import { connectorSelector } from "../../../store/features/integrations/integrationsSlice.ts";

function ConfigButtons({ connector }) {
  const { id } = useParams();
  const connectorActive = id !== undefined && id !== null;
  const currentConnector = useSelector(connectorSelector);

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        <UpdateConnectorButton id={id} connector={connector} />
        <TestConnectorButton
          id={id}
          connector={connector}
          formData={connectorActive ? connector : currentConnector}
        />
        {connectorActive && (
          <DeleteConnectorButton connector={connector} id={id} />
        )}
      </div>
      <ShowTestConnectorResult />
    </>
  );
}

export default ConfigButtons;
