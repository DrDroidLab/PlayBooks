import React from "react";
import { useParams } from "react-router-dom";
import UpdateConnectorButton from "../../Buttons/UpdateConnectorButton/index.tsx";
import DeleteConnectorButton from "../../Buttons/DeleteConnectorButton/index.tsx";
import TestConnectorButton from "../../Buttons/TestConnectorButton/index.tsx";
import ShowTestConnectorResult from "../../ShowTestConnectorResult/index.tsx";

function ConfigButtons({ connector }) {
  const { id } = useParams();
  const connectorActive = id !== undefined && id !== null;

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        <UpdateConnectorButton id={id} connector={connector} />
        <TestConnectorButton
          id={id}
          connector={connector}
          formData={connector}
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
