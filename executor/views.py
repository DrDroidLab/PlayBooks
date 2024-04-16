from typing import Union

from django.http import HttpResponse

from google.protobuf.wrappers_pb2 import BoolValue, StringValue

from accounts.models import Account, get_request_account
from executor.task_executor import execute_task
from playbooks.utils.decorators import web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.utils import current_epoch_timestamp
from protos.base_pb2 import Meta, TimeRange
from protos.playbooks.api_pb2 import RunPlaybookTaskRequest, RunPlaybookTaskResponse
from protos.playbooks.playbook_pb2 import PlaybookTaskExecutionResult


@web_api(RunPlaybookTaskRequest)
def task_run(request_message: RunPlaybookTaskRequest) -> Union[RunPlaybookTaskResponse, HttpResponse]:
    account: Account = get_request_account()
    meta: Meta = request_message.meta
    time_range: TimeRange = meta.time_range
    if not time_range.time_lt or not time_range.time_geq:
        current_time = current_epoch_timestamp()
        time_range = TimeRange(time_geq=int(current_time - 14400), time_lt=int(current_time))
    task = request_message.playbook_task_definition
    try:
        task_execution_result = execute_task(account.id, time_range, task)
    except Exception as e:
        return RunPlaybookTaskResponse(meta=get_meta(tr=time_range), success=BoolValue(value=False),
                                       task_execution_result=PlaybookTaskExecutionResult(
                                           error=StringValue(value=str(e))))
    return RunPlaybookTaskResponse(meta=get_meta(tr=time_range), success=BoolValue(value=True),
                                   task_execution_result=task_execution_result)
