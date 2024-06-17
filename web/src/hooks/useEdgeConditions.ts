import usePlaybookKey from "./usePlaybookKey.ts";
import { addConditionToEdgeByIndex } from "../utils/conditionals/addConditionToEdgeByIndex.ts";

function useEdgeConditions(source: string, target: string) {
  const [playbookEdges, setPlaybookEdges] = usePlaybookKey("playbookEdges");
  const edgeIndex = playbookEdges?.findIndex(
    (e) => e.source === source && e.target === target,
  );
  const edge = playbookEdges?.length > 0 ? playbookEdges[edgeIndex] : undefined;
  const conditions = edge?.conditions ?? [];

  const addNewCondition = () => {
    const newCondition = {
      function: "",
      operation: "",
      value: "",
    };
    const temp = structuredClone(playbookEdges ?? []);
    const tempEdge = temp[edgeIndex];
    if (!tempEdge) return;
    tempEdge.conditions = [...(tempEdge.conditions ?? []), newCondition];

    setPlaybookEdges(temp);
  };

  const handleUpdateCondition = (
    key: string,
    value: string,
    conditionIndex: number,
  ) => {
    addConditionToEdgeByIndex(key, value, edgeIndex, conditionIndex);
  };

  const deleteCondition = (conditionIndex: number) => {
    const temp = structuredClone(playbookEdges ?? []);
    const tempEdge = temp[edgeIndex];
    tempEdge.conditions = tempEdge.conditions.filter(
      (c, i) => i !== conditionIndex,
    );
    setPlaybookEdges(temp);
  };

  const handleCondition = (
    key: string,
    value: string,
    conditionIndex: number,
  ) => {
    if (conditions.length === 0) {
      addNewCondition();
    } else {
      handleUpdateCondition(key, value, conditionIndex);
    }
  };

  return {
    playbookEdges,
    edge,
    edgeIndex,
    conditions,
    handleCondition,
    addNewCondition,
    deleteCondition,
  };
}

export default useEdgeConditions;
