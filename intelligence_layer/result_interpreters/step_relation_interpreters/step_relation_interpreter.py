from google.protobuf.wrappers_pb2 import StringValue

from intelligence_layer.result_interpreters.step_relation_interpreters.conditional_rule_interpreters.conditional_rule_interpreter_facade import \
    conditional_rule_interpreter_facade
from protos.base_pb2 import LogicalOperator
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation
from protos.playbooks.playbook_pb2 import PlaybookStepRelation, PlaybookStepResultCondition


def logical_operator_enum_to_string(logical_operator: LogicalOperator):
    if logical_operator == LogicalOperator.OR_LO:
        return 'or'
    elif logical_operator == LogicalOperator.AND_LO:
        return 'and'
    else:
        return ''


def step_relation_interpret(relation: PlaybookStepRelation):
    condition: PlaybookStepResultCondition = relation.condition
    rule_sets = condition.rule_sets
    operator = logical_operator_enum_to_string(condition.logical_operator)
    relation_interpretation_string = ''
    for rs in rule_sets:
        rules = rs.rules
        for r in rules:
            rule_interpretation = conditional_rule_interpreter_facade.interpret(r)
            if not relation_interpretation_string:
                relation_interpretation_string = rule_interpretation
            else:
                relation_interpretation_string += f'{operator} {rule_interpretation}'

    return relation_interpretation_string
