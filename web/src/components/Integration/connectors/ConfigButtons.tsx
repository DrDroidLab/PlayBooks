import React from "react";
import { useParams } from "react-router-dom";
import UpdateConnectorButton from "../../Buttons/UpdateConnectorButton/index.tsx";
import DeleteConnectorButton from "../../Buttons/DeleteConnectorButton/index.tsx";
import TestConnectorButton from "../../Buttons/TestConnectorButton/index.tsx";
import { useSelector } from "react-redux";
import { testDataSelector } from "../../../store/features/integrations/integrationsSlice.ts";

function ConfigButtons({ connector }) {
  const { id } = useParams();
  const connectorActive = id !== undefined && id !== null;
  const testData = useSelector(testDataSelector);
  const message =
    testData?.message?.title || testData?.error?.message || testData?.message;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        <UpdateConnectorButton id={id} connector={connector} />
        <TestConnectorButton id={id} connector={connector} />
        {connectorActive && (
          <DeleteConnectorButton connector={connector} id={id} />
        )}
      </div>
      {message && (
        <p
          className={`${
            testData?.error ? "text-red-500" : "text-green-500"
          } text-xs`}>
          {message?.toString()}
        </p>
      )}
    </div>
  );
}

export default ConfigButtons;
