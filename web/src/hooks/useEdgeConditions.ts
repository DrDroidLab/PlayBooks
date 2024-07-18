import { addConditionToEdgeByIndex } from "../utils/conditionals/addConditionToEdgeByIndex.ts";
import { ruleOptions } from "../utils/conditionals/ruleOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  addRule,
  currentPlaybookSelector,
  setCurrentPlaybookKey,
} from "../store/features/playbook/playbookSlice.ts";
import {
  LogicalOperator,
  StepRelation,
  StepRelationContract,
} from "../types/stepRelations.ts";

const playbookKey = "step_relations";

function useEdgeConditions(id: string) {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const relations = currentPlaybook?.step_relations ?? [];
  const relation = relations.find((r) => r.id === id);
  const edgeIndex = relations?.findIndex((e) => e.id === id);
  const edge = relations?.length > 0 ? relations[edgeIndex] : undefined;
  const conditions = edge?.condition?.rules ?? [];
  const condition = relation?.condition;
  const rules = condition?.rules ?? [];
  const globalRule = edge?.condition?.logical_operator ?? ruleOptions[0].id;
  const dispatch = useDispatch();

  const setPlaybookRelations = (
    value: (StepRelation | StepRelationContract)[],
  ) => {
    dispatch(
      setCurrentPlaybookKey({
        key: playbookKey,
        value,
      }),
    );
  };

  const addNewRule = () => {
    dispatch(addRule({ id: relation?.id }));
  };

  const deleteCondition = (conditionIndex: number) => {
    const temp = structuredClone(relations ?? []);
    const tempEdge = temp[edgeIndex];
    if (!tempEdge.condition) return;
    tempEdge.condition.rules = tempEdge.condition?.rules.filter(
      (c, i) => i !== conditionIndex,
    );
    setPlaybookRelations(temp);
  };

  const handleCondition = (
    key: string,
    value: string | undefined,
    conditionIndex: number,
  ) => {
    if (conditions.length !== 0) {
      addConditionToEdgeByIndex(key, value, edgeIndex, conditionIndex);
    }
  };

  const handleRule = (key: string, value: string, ruleIndex: number) => {
    if (rules.length === 0) {
      addNewRule();
    } else {
      addConditionToEdgeByIndex(key, value, edgeIndex, ruleIndex);
    }
  };

  const handleGlobalRule = (value: string) => {
    const temp = structuredClone(relations ?? []);
    const tempEdge = temp[edgeIndex];
    if (!tempEdge.condition) return;
    tempEdge.condition.logical_operator = value as LogicalOperator;
    setPlaybookRelations(temp);
  };

  return {
    playbookEdges: relations,
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
