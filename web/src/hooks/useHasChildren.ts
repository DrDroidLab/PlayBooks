import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

function useHasChildren(id: string) {
  const { playbookEdges } = useSelector(playbookSelector);

  const childEdeges = (playbookEdges ?? []).findIndex(
    (e) => e.source === `node-${id}`,
  );

  return childEdeges !== -1;
}

export default useHasChildren;
