import { StepRelation, StepRelationContract } from "../../../../types/index.ts";

function extractExecutionRelations(
  relationLogs: any,
  relations: (StepRelationContract | StepRelation)[],
) {
  relationLogs?.forEach((log: any) => {
    const playbookRelation: StepRelation | undefined = (
      relations as StepRelation[]
    ).find(
      (relation) =>
        (relation as StepRelation).ui_requirement?.playbookRelationId ===
        log.relation.id,
    );
    if (playbookRelation) {
      playbookRelation.ui_requirement = {
        ...playbookRelation.ui_requirement,
        evaluation: {
          evaluation_output: log.evaluation_output,
          evaluation_result: log.evaluation_result,
        },
      };
    }
  });
}

export default extractExecutionRelations;
