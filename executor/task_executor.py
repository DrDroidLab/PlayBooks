from google.protobuf.wrappers_pb2 import StringValue

from executor.task_executor_facade import executor_facade
from executor.utils.old_to_new_model_transformers import transform_PlaybookTaskResult_to_PlaybookTaskExecutionResult
from playbooks.utils.decorators import deprecated
from protos.playbooks.deprecated_playbook_pb2 import DeprecatedPlaybookTaskDefinition, DeprecatedPlaybookTaskExecutionResult


@deprecated
def execute_task(account_id, time_range, playbook_task: DeprecatedPlaybookTaskDefinition) -> \
        DeprecatedPlaybookTaskExecutionResult:
    task_type = playbook_task.type
    global_variable_set = playbook_task.global_variable_set
    for global_variable_key in list(global_variable_set.keys()):
        if not global_variable_key.startswith('$'):
            raise ValueError(f'Global Variable Key {global_variable_key} should start with $')

    try:
        if task_type == DeprecatedPlaybookTaskDefinition.Type.METRIC:
            metric_task = playbook_task.metric_task
            print("Playbook Task Execution: Type -> {}, Account -> {}, Time Range -> {}, Global Variable Set -> {}, "
                  "Task -> {}".format("Metric", account_id, time_range, global_variable_set, metric_task),
                  flush=True)
            task_result = executor_facade.execute_task(account_id, time_range, global_variable_set,
                                                       metric_task)
        elif task_type == DeprecatedPlaybookTaskDefinition.Type.DATA_FETCH:
            data_fetch_task = playbook_task.data_fetch_task
            print("Playbook Task Execution: Type -> {}, Account -> {}, Global Variable Set -> {}, "
                  "Task -> {}".format("Data_Fetch", account_id, global_variable_set, data_fetch_task),
                  flush=True)
            task_result = executor_facade.execute_task(account_id, time_range, global_variable_set,
                                                       data_fetch_task)
        elif task_type == DeprecatedPlaybookTaskDefinition.Type.ACTION:
            action_task = playbook_task.action_task
            print("Playbook Task Execution: Type -> {}, Account -> {}, Global Variable Set -> {}, "
                  "Task -> {}".format("Data_Fetch", account_id, global_variable_set, action_task),
                  flush=True)
            task_result = executor_facade.execute_task(account_id, time_range, global_variable_set, action_task)
        elif task_type == DeprecatedPlaybookTaskDefinition.Type.DOCUMENTATION:
            return DeprecatedPlaybookTaskExecutionResult(
                message=StringValue(value="Documentation task executed successfully"))
        else:
            raise ValueError(f'No executor found for task type: {task_type}')
        return transform_PlaybookTaskResult_to_PlaybookTaskExecutionResult(task_result)
    except Exception as e:
        raise e
