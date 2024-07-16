from intelligence_layer.result_interpreters.step_relation_interpreters.conditional_rule_interpreters.conditional_rule_interpreter import \
    ConditionalRuleInterpreter
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule
from protos.playbooks.playbook_task_result_evaluator_pb2 import BashCommandOutputResultRule


def rule_type_to_str(rule: BashCommandOutputResultRule):
    if rule.type == BashCommandOutputResultRule.Type.GREP_COUNTER:
        return 'check grep with pattern'
    else:
        return ''


class BashCommandOutputConditionalRuleInterpreter(ConditionalRuleInterpreter):
    def __int__(self):
        self.task_result_type = PlaybookTaskResultType.BASH_COMMAND_OUTPUT

    def interpret(self, rule: PlaybookTaskResultRule):
        bash_command_rule: BashCommandOutputResultRule = rule.bash_command_output

        rule_type = rule_type_to_str(bash_command_rule)
        pattern = bash_command_rule.pattern
        case_sensitive = bash_command_rule.case_sensitive
        if case_sensitive:
            pattern = f'{pattern} (case sensitive)'
        else:
            pattern = f'{pattern} (case insensitive)'
        grep_count = bash_command_rule.grep_count
        if grep_count > 0:
            interpretation_string = f'{rule_type} {pattern} occurrence count is atleast {grep_count}'
        elif grep_count == 0:
            interpretation_string = f'{rule_type} {pattern} occurrence count is 0'
        else:
            interpretation_string = ''
        return interpretation_string
