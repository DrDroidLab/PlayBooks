from typing import Dict

import requests
from google.protobuf.struct_pb2 import Struct

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from executor.action_task_executor.action_task_executor import PlaybookActionTaskExecutor
from protos.playbooks.playbook_pb2 import PlaybookActionTaskDefinition as PlaybookActionTaskDefinitionProto, \
    PlaybookActionTaskExecutionResult as PlaybookActionTaskExecutionResultProto, \
    PlaybookApiCallTask as PlaybookApiCallTaskProto

method_proto_string_mapping = {
    PlaybookApiCallTaskProto.Method.GET: "GET",
    PlaybookApiCallTaskProto.Method.POST: "POST",
    PlaybookApiCallTaskProto.Method.PUT: "PUT",
    PlaybookApiCallTaskProto.Method.PATCH: "PATCH",
    PlaybookApiCallTaskProto.Method.DELETE: "DELETE",
}


class ApiActionTaskExecutor(PlaybookActionTaskExecutor):

    def __init__(self, account_id):
        self.source = PlaybookActionTaskDefinitionProto.Source.API

        self.__account_id = account_id

    def execute(self, global_variable_set: Dict,
                task: PlaybookActionTaskDefinitionProto) -> PlaybookActionTaskExecutionResultProto:
        try:
            api_action_task: PlaybookApiCallTaskProto = task.api_call_task
            method = api_action_task.method
            url = api_action_task.url.value
            for key, value in global_variable_set.items():
                uri = uri.replace(f"{{{key}}}", value)
            headers = api_action_task.headers
            payload = api_action_task.payload
            timeout = api_action_task.timeout.value if api_action_task.timeout else 120
            cookies = api_action_task.cookies

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

                api_action_result = PlaybookActionTaskExecutionResultProto.Result.ApiResponse(
                    request_method=StringValue(value=request_method),
                    request_url=StringValue(value=url),
                    response_status=UInt64Value(value=response.status_code),
                    response_headers=response_headers_struct,
                    response_body=response_struct
                )
                return PlaybookActionTaskExecutionResultProto(
                    action_task_id=UInt64Value(value=task.id.value),
                    action_task_name=StringValue(value=task.name.value),
                    result=PlaybookActionTaskExecutionResultProto.Result(
                        type=PlaybookActionTaskExecutionResultProto.Result.Type.API_RESPONSE,
                        api_response=api_action_result
                    )
                )
            except Exception as e:
                raise Exception(f"Error while executing API call task: {e}")
        except Exception as e:
            raise Exception(f"Error while executing API call task: {e}")
