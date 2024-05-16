from typing import Dict

import requests
from google.protobuf.struct_pb2 import Struct

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from executor.action_task_executor.action_task_executor import PlaybookActionTaskExecutor
from protos.base_pb2 import Source
from protos.playbooks.source_task_definitions.api_call_task_pb2 import PlaybookApiCallTask
from protos.playbooks.playbook_pb2 import PlaybookActionTaskDefinition as PlaybookActionTaskDefinitionProto, \
    PlaybookActionTaskExecutionResult as PlaybookActionTaskExecutionResultProto
from utils.proto_utils import proto_to_dict

method_proto_string_mapping = {
    PlaybookApiCallTask.Method.GET: "GET",
    PlaybookApiCallTask.Method.POST: "POST",
    PlaybookApiCallTask.Method.PUT: "PUT",
    PlaybookApiCallTask.Method.PATCH: "PATCH",
    PlaybookApiCallTask.Method.DELETE: "DELETE",
}


class ApiActionTaskExecutor(PlaybookActionTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.API

        self.__account_id = account_id

    def execute(self, global_variable_set: Dict,
                task: PlaybookActionTaskDefinitionProto) -> PlaybookActionTaskExecutionResultProto:
        try:
            api_action_task: PlaybookApiCallTask = task.api_call_task
            method = api_action_task.method
            url = api_action_task.url.value
            for key, value in global_variable_set.items():
                url = url.replace(f"{{{key}}}", value)
            headers = proto_to_dict(api_action_task.headers) if api_action_task.headers else {}
            payload = proto_to_dict(api_action_task.payload) if api_action_task.payload else {}
            timeout = api_action_task.timeout.value if api_action_task.timeout else 120
            cookies = proto_to_dict(api_action_task.cookies) if api_action_task.cookies else {}

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
