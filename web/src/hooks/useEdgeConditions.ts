import usePlaybookKey from "./usePlaybookKey.ts";
import { addConditionToEdgeByIndex } from "../utils/conditionals/addConditionToEdgeByIndex.ts";
import { ruleOptions } from "../utils/conditionals/ruleOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  addRule,
  currentPlaybookSelector,
} from "../store/features/playbook/playbookSlice.ts";

function useEdgeConditions(id: string) {
  const [playbookEdges, setPlaybookEdges] = usePlaybookKey("playbookEdges");
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const relations = currentPlaybook?.step_relations ?? [];
  const relation = relations.find((r) => r.id === id);
  const edgeIndex = playbookEdges?.findIndex((e) => e.id === id);
  const edge = playbookEdges?.length > 0 ? playbookEdges[edgeIndex] : undefined;
  const conditions = edge?.conditions ?? [];
  const condition = relation?.condition;
  const rules = condition?.rules ?? [];
  const globalRule = edge?.globalRule ?? ruleOptions[0].id;
  const dispatch = useDispatch();

  const addNewRule = () => {
    dispatch(addRule({ id: relation?.id }));
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
    } else {
      handleUpdateCondition(key, value, conditionIndex);
    }
  };

  const handleRule = (key: string, value: string, ruleIndex: number) => {
    if (rules.length === 0) {
      addNewRule();
    } else {
      handleUpdateCondition(key, value, ruleIndex);
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
    condition,
    rules,
    handleCondition,
    handleRule,
    addNewRule,
    deleteCondition,
    handleGlobalRule,
  };
}

export default useEdgeConditions;
