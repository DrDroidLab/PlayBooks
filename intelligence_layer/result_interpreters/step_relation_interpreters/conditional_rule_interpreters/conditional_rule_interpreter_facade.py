from intelligence_layer.result_interpreters.step_relation_interpreters.conditional_rule_interpreters.conditional_rule_interpreter import \
    ConditionalRuleInterpreter
from intelligence_layer.result_interpreters.step_relation_interpreters.conditional_rule_interpreters.table_conditional_rule_interpreter import \
    TableConditionalRuleInterpreter
from intelligence_layer.result_interpreters.step_relation_interpreters.conditional_rule_interpreters.timeseries_conditional_rule_interpreter import \
    TimeseriesConditionalRuleInterpreter
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule


class ConditionalRuleInterpreterFacade:

    def __init__(self):
        self._map = {}

    def register(self, rule_type: PlaybookTaskResultType, interpreter: ConditionalRuleInterpreter):
        self._map[rule_type] = interpreter

    def interpret(self, rule: PlaybookTaskResultRule):
        rule_type = rule.type
        if not rule_type or rule_type not in self._map:
            raise ValueError(f"Result rule type {rule_type} is not supported")

        return self._map[rule_type].interpret(rule)


conditional_rule_interpreter_facade = ConditionalRuleInterpreterFacade()
conditional_rule_interpreter_facade.register(PlaybookTaskResultType.TIMESERIES, TimeseriesConditionalRuleInterpreter())
conditional_rule_interpreter_facade.register(PlaybookTaskResultType.TABLE, TableConditionalRuleInterpreter())
conditional_rule_interpreter_facade.register(PlaybookTaskResultType.LOGS, TableConditionalRuleInterpreter())
