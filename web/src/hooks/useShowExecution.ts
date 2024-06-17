import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "./useIsPrefetched.ts";

export default function useShowExecution() {
  const playbook = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();

  return (
    !playbook?.currentPlaybook?.isCopied &&
    !isPrefetched &&
    Object.keys(playbook?.currentPlaybook ?? {}).length > 0
  );
}
