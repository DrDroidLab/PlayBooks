import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

function useHasChildren(index: number) {
  const { playbookEdges } = useSelector(playbookSelector);

  const childEdeges = (playbookEdges ?? []).findIndex(
    (e) => e.source === `node-${index}`,
  );

  return childEdeges !== -1;
}

export default useHasChildren;
