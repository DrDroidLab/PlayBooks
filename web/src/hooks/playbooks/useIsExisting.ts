import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";

export default function useIsExisting() {
  const currentPlaybook = useSelector(currentPlaybookSelector);

  return currentPlaybook?.ui_requirement.isExisting;
}
