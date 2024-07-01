import { useSelector } from "react-redux";
import { testDataSelector } from "../store/features/integrations/integrationsSlice.ts";

function useTestData() {
  const testData = useSelector(testDataSelector);
  const message =
    testData?.message?.title || testData?.error?.message || testData?.message;

  return { message, isError: testData?.error };
}

export default useTestData;
