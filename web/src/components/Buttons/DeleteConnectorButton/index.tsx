import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConnectorDeleteOverlay from "../../Integration/connectors/ConnectorDeleteOverlay";
import CustomButton from "../../common/CustomButton/index.tsx";

function DeleteConnectorButton({ id, connector }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <>
      <CustomButton
        onClick={async () => {
          setIsDeleting(true);
        }}>
        Delete
      </CustomButton>
      <ConnectorDeleteOverlay
        isOpen={isDeleting}
        connector={{ ...connector, id }}
        toggleOverlay={() => setIsDeleting(!isDeleting)}
        successCb={() => {
          navigate("/data-sources");
        }}
      />
    </>
  );
}

export default DeleteConnectorButton;
