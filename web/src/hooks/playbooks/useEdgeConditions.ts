import { addRuleToRelationByIndex } from "../../utils/conditionals/addRuleToRelationByIndex.ts";
import { ruleOptions } from "../../utils/conditionals/ruleOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  addRule,
  addStepRule,
  currentPlaybookSelector,
  setCurrentPlaybookKey,
} from "../../store/features/playbook/playbookSlice.ts";
import {
  LogicalOperator,
  StepRelation,
  StepRelationContract,
} from "../../types";
import { RuleType } from "../../components/common/Conditions/types/RuleTypes.ts";
import { handleRelationRuleChange } from "../../utils/conditionals/handleRelationRuleChange.ts";

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
  const step_rules = condition?.step_rules ?? [];
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
    if (!relation?.id) return;
    dispatch(addRule({ id: relation?.id }));
  };

  const addNewStepRule = () => {
    if (!relation?.id) return;
    dispatch(addStepRule({ id: relation?.id }));
  };

  const deleteRule = (conditionIndex: number) => {
    const temp = structuredClone(relations ?? []);
    const tempEdge = temp[edgeIndex];
    if (!tempEdge.condition) return;
    tempEdge.condition.rules = tempEdge.condition?.rules.filter(
      (c, i) => i !== conditionIndex,
    );
    setPlaybookRelations(temp);
  };

  const deleteStepRule = (conditionIndex: number) => {
    const temp = structuredClone(relations ?? []);
    const tempEdge = temp[edgeIndex];
    if (!tempEdge.condition) return;
    tempEdge.condition.step_rules = tempEdge.condition?.step_rules.filter(
      (_, i) => i !== conditionIndex,
    );
    setPlaybookRelations(temp);
  };

  const handleRule = (
    key: string,
    value: any,
    ruleIndex: number,
    ruleType: RuleType,
  ) => {
    handleRelationRuleChange(key, value, edgeIndex, ruleIndex, ruleType);
  };

  const handleGlobalRule = (value: string) => {
    const temp = structuredClone(relations ?? []);
    const tempEdge = temp[edgeIndex];
    if (!tempEdge.condition) return;
    tempEdge.condition.logical_operator = value as LogicalOperator;
    setPlaybookRelations(temp);
  };

  const handleDeleteRule = (ruleType: RuleType, index: number) => {
    switch (ruleType) {
      case RuleType.RULE:
        deleteRule(index);
        break;
      case RuleType.STEP_RULE:
        deleteStepRule(index);
        break;
      default:
        return;
    }
  };

  return {
    playbookEdges: relations,
    edge,
    edgeIndex,
    conditions,
    globalRule,
    condition,
    rules,
    step_rules,
    handleRule,
    addNewStepRule,
    addNewRule,
    handleDeleteRule,
    handleGlobalRule,
  };
}

export default useEdgeConditions;
