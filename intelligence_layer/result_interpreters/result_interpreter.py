from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult


class ResultInterpreter:
    type = InterpreterType.UNKNOWN_I

    def interpret(self, result: PlaybookTaskResult):
        pass
