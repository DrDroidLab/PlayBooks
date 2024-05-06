from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.playbook_pb2 import PlaybookStepDefinition as PlaybookStepDefinitionProto


def basic_step_summariser(step: PlaybookStepDefinitionProto,
                          task_interpretations: [InterpretationProto]) -> [InterpretationProto]:
    return task_interpretations


def llm_chat_gpt_vision_step_summariser(step: PlaybookStepDefinitionProto,
                                        task_interpretations: [InterpretationProto]) -> [InterpretationProto]:
    return task_interpretations
