import { useSearchParams } from "react-router-dom";

export default function useIsPrefetched() {
  const [searchParams] = useSearchParams("executionId");

  return searchParams.get("executionId");
}
