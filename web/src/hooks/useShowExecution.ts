import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

export default function useShowExecution() {
  const playbook = useSelector(playbookSelector);

  return (
    !playbook?.currentPlaybook?.isCopied &&
    Object.keys(playbook?.currentPlaybook ?? {}).length > 0
  );
}
