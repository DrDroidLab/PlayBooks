from google.protobuf.wrappers_pb2 import StringValue

from executor.action_task_executor.action_task_executor_facade import action_task_executor
from executor.data_fetch_task_executor.data_fetch_task_executor_facade import data_fetch_task_executor
from executor.decision_task_executor.decision_task_executor_facade import decision_task_evaluator
from executor.metric_task_executor.playbook_metric_task_executor_facade import metric_task_executor
from protos.playbooks.playbook_pb2 import PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    PlaybookTaskExecutionResult


def execute_task(account_id, time_range, playbook_task: PlaybookTaskDefinitionProto) -> \
        PlaybookTaskExecutionResult:
    task_type = playbook_task.type
    global_variable_set = playbook_task.global_variable_set
    for global_variable_key in list(global_variable_set.keys()):
        if not global_variable_key.startswith('$'):
            raise ValueError(f'Global Variable Key {global_variable_key} should start with $')

    try:
        if task_type == PlaybookTaskDefinitionProto.Type.METRIC:
            metric_task = playbook_task.metric_task
            print("Playbook Task Execution: Type -> {}, Account -> {}, Time Range -> {}, Global Variable Set -> {}, "
                  "Task -> {}".format("Metric", account_id, time_range, global_variable_set, metric_task),
                  flush=True)
            metric_task_result = metric_task_executor.execute_metric_task(account_id, time_range, global_variable_set,
                                                                          metric_task)
            return PlaybookTaskExecutionResult(metric_task_execution_result=metric_task_result)
        elif task_type == PlaybookTaskDefinitionProto.Type.DECISION:
            decision_task = playbook_task.decision_task
            print("Playbook Task Execution: Type -> {}, Account -> {}, Global Variable Set -> {}, "
                  "Task -> {}".format("Decision", account_id, global_variable_set, decision_task),
                  flush=True)
            decision_task_result = decision_task_evaluator.evaluate_decision_task(global_variable_set, decision_task)
            return PlaybookTaskExecutionResult(decision_task_execution_result=decision_task_result)
        elif task_type == PlaybookTaskDefinitionProto.Type.DATA_FETCH:
            data_fetch_task = playbook_task.data_fetch_task
            print("Playbook Task Execution: Type -> {}, Account -> {}, Global Variable Set -> {}, "
                  "Task -> {}".format("Data_Fetch", account_id, global_variable_set, data_fetch_task),
                  flush=True)
            data_fetch_task_result = data_fetch_task_executor.execute_data_fetch_task(account_id, global_variable_set,
                                                                                      data_fetch_task)
            return PlaybookTaskExecutionResult(data_fetch_task_execution_result=data_fetch_task_result)
        elif task_type == PlaybookTaskDefinitionProto.Type.ACTION:
            action_task = playbook_task.action_task
            print("Playbook Task Execution: Type -> {}, Account -> {}, Global Variable Set -> {}, "
                  "Task -> {}".format("Data_Fetch", account_id, global_variable_set, action_task),
                  flush=True)
            action_task_result = action_task_executor.execute_action_task(account_id, global_variable_set, action_task)
            return PlaybookTaskExecutionResult(action_task_execution_result=action_task_result)
        elif task_type == PlaybookTaskDefinitionProto.Type.DOCUMENTATION:
            return PlaybookTaskExecutionResult(message=StringValue(value="Documentation task executed successfully"))
        else:
            raise ValueError(f'No executor found for task type: {task_type}')
    except Exception as e:
        raise e
