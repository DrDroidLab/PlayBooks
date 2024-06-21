import { PlaybookContractStep, Step } from "../../../types.ts";
import { ResultTypeType } from "../../conditionals/resultTypeOptions.ts";
import handleResultType from "./handleResultType.ts";

export default function conditionToRule(
  parentStep: Step,
  parentPlaybookStep: PlaybookContractStep,
  condition: any,
) {
  const resultType: ResultTypeType = parentStep.resultType as ResultTypeType;
  return {
    type: resultType,
    task: {
      reference_id: parentPlaybookStep.tasks[condition.task ?? 0].reference_id,
    },
    [resultType!.toLowerCase()]: handleResultType(resultType, condition),
  };
}
