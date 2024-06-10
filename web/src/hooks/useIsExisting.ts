import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

export default function useIsExisting() {
  const playbook = useSelector(playbookSelector);

  return (
    !playbook?.currentPlaybook?.isCopied &&
    playbook?.isEditing &&
    Object.keys(playbook?.currentPlaybook ?? {}).length > 0
  );
}
