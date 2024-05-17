from typing import Dict

import requests
from google.protobuf.struct_pb2 import Struct

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from executor.playbook_task_executor import PlaybookTaskExecutor
from protos.base_pb2 import Source, TimeRange
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, ApiResponseResult, PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTask
from protos.playbooks.source_task_definitions.api_task_pb2 import Api

from utils.proto_utils import proto_to_dict

method_proto_string_mapping = {
    Api.HttpRequest.Method.GET: "GET",
    Api.HttpRequest.Method.POST: "POST",
    Api.HttpRequest.Method.PUT: "PUT",
    Api.HttpRequest.Method.PATCH: "PATCH",
    Api.HttpRequest.Method.DELETE: "DELETE",
}


class ApiTaskExecutor(PlaybookTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.API
        self.__account_id = account_id
        self.task_type_callable_map = {
            Api.TaskType.HTTP_REQUEST: self.execute_http_request,
        }

    def execute(self, time_range: TimeRange, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        api_task: Api = task.api
        task_type = api_task.type
        task_callable = self.task_type_callable_map.get(task_type)
        if task_callable:
            return task_callable(time_range, global_variable_set, api_task)
        else:
            raise Exception(f"Unsupported task type: {task_type}")

    def execute_http_request(self, time_range: TimeRange, global_variable_set: Dict,
                             api_task: Api) -> PlaybookTaskResult:
        try:
            http_request = api_task.http_request
            method = http_request.method
            url = http_request.url.value
            for key, value in global_variable_set.items():
                url = url.replace(f"{{{key}}}", value)
            headers = proto_to_dict(http_request.headers) if http_request.headers else {}
            payload = proto_to_dict(http_request.payload) if http_request.payload else {}
            timeout = http_request.timeout.value if http_request.timeout else 120
            cookies = proto_to_dict(http_request.cookies) if http_request.cookies else {}

            request_method = method_proto_string_mapping.get(method)
            request_arguments = {
                "method": request_method,
                "url": url,
                "headers": headers,
                "timeout": timeout,
                "cookies": cookies
            }

            if request_method in ["POST", "PUT", "PATCH"]:
                request_arguments["json"] = payload
            elif request_method == "GET":
                request_arguments["params"] = payload
            else:
                raise Exception(f"Unsupported api method: {request_method}")

            try:
                response = requests.request(**request_arguments)
                response_headers = response.headers
                response_headers_struct = Struct()
                response_headers_struct.update(response_headers)

                response_json = response.json()
                response_struct = Struct()
                response_struct.update(response_json)

                api_response = ApiResponseResult(
                    request_method=StringValue(value=request_method),
                    request_url=StringValue(value=url),
                    response_status=UInt64Value(value=response.status_code),
                    response_headers=response_headers_struct,
                    response_body=response_struct
                )
                return PlaybookTaskResult(
                    source=self.source,
                    type=PlaybookTaskResultType.API_RESPONSE,
                    api_response=api_response,
                )
            except Exception as e:
                raise Exception(f"Error while executing API call task: {e}")
        except Exception as e:
            raise Exception(f"Error while executing API call task: {e}")
