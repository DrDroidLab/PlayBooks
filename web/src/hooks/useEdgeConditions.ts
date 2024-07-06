import usePlaybookKey from "./usePlaybookKey.ts";
import { addConditionToEdgeByIndex } from "../utils/conditionals/addConditionToEdgeByIndex.ts";
import { ruleOptions } from "../utils/conditionals/ruleOptions.ts";
import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../store/features/playbook/playbookSlice.ts";

function useEdgeConditions(id: string) {
  const [playbookEdges, setPlaybookEdges] = usePlaybookKey("playbookEdges");
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const relations = currentPlaybook?.step_relations ?? [];
  console.log("relations", relations);
  const edgeIndex = playbookEdges?.findIndex((e) => e.id === id);
  const edge = playbookEdges?.length > 0 ? playbookEdges[edgeIndex] : undefined;
  const conditions = edge?.conditions ?? [];
  const globalRule = edge?.globalRule ?? ruleOptions[0].id;

  const addNewCondition = () => {
    const newCondition = {
      function: "",
      operation: "",
      value: "",
      task: "",
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

  const handleGlobalRule = (value: string) => {
    const temp = structuredClone(playbookEdges ?? []);
    const tempEdge = temp[edgeIndex];
    tempEdge.globalRule = value;
    setPlaybookEdges(temp);
  };

  return {
    playbookEdges,
    edge,
    edgeIndex,
    conditions,
    globalRule,
    handleCondition,
    addNewCondition,
    deleteCondition,
    handleGlobalRule,
  };
}

export default useEdgeConditions;
