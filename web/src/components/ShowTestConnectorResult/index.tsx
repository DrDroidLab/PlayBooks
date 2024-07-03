import React, { useEffect } from "react";
import useTestData from "../../hooks/useTestData.ts";
import { useDispatch } from "react-redux";
import { setTestConnectorData } from "../../store/features/integrations/integrationsSlice.ts";

function ShowTestConnectorResult() {
  const { message, isError } = useTestData();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTestConnectorData({}));
    return () => {
      dispatch(setTestConnectorData({}));
    };
  }, [dispatch]);

  if (!message) return;

  return (
    <p
      className={`${isError ? "text-red-500" : "text-green-500"} text-xs mt-2`}>
      {message?.toString()}
    </p>
  );
}

export default ShowTestConnectorResult;
