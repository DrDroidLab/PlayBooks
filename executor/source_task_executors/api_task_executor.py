import json
from typing import Dict

import requests
from google.protobuf.struct_pb2 import Struct

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from executor.playbook_source_manager import PlaybookSourceManager
from protos.base_pb2 import Source, TimeRange
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, ApiResponseResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.api_task_pb2 import Api

from utils.proto_utils import proto_to_dict

method_proto_string_mapping = {
    Api.HttpRequest.Method.GET: "GET",
    Api.HttpRequest.Method.POST: "POST",
    Api.HttpRequest.Method.PUT: "PUT",
    Api.HttpRequest.Method.PATCH: "PATCH",
    Api.HttpRequest.Method.DELETE: "DELETE",
}


class ApiSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.API
        self.task_proto = Api
        self.task_type_callable_map = {
            Api.TaskType.HTTP_REQUEST: {
                'task_type': 'HTTP_REQUEST',
                'executor': self.execute_http_request,
                'model_types': [],
                'display_name': 'Trigger an API',
                'category': 'Actions'
            },
        }

    def execute_http_request(self, time_range: TimeRange, global_variable_set: Dict,
                             api_task: Api, api_connector_proto: ConnectorProto) -> PlaybookTaskResult:
        try:
            http_request = api_task.http_request
            method = http_request.method
            url = http_request.url.value
            for key, value in global_variable_set.items():
                url = url.replace(f"{{{key}}}", value)
            headers = http_request.headers.value
            headers = json.loads(headers) if headers else {}
            if 'Content-Type' not in headers:
                headers['Content-Type'] = 'application/json'
            payload = http_request.payload.value
            timeout = http_request.timeout.value if http_request.timeout else 120
            cookies = http_request.cookies.value
            cookies = json.loads(cookies) if cookies else None

            request_method = method_proto_string_mapping.get(method)
            request_arguments = {
                "method": request_method,
                "url": url,
                "headers": headers,
                "timeout": timeout,
                "cookies": cookies
            }

            if request_method in ["POST", "PUT", "PATCH"]:
                request_arguments["data"] = payload
            elif request_method == "GET":
                request_arguments["params"] = json.loads(payload) if payload else None
            else:
                raise Exception(f"Unsupported api method: {request_method}")

            try:
                response = requests.request(**request_arguments)
                response_headers = response.headers
                response_headers_struct = Struct()
                response_headers_struct.update(response_headers)

                content_type = response.headers.get('Content-Type', '')
                if 'application/json' in content_type:
                    try:
                        response_data = response.json()
                        print("Response JSON:", response_data)
                    except json.JSONDecodeError:
                        print("Error: Response content is not valid JSON")
                        raise Exception("Error: Response content is not valid JSON")
                elif 'text' in content_type:
                    response_data = {'response_text': response.text}
                else:
                    response_data = {'raw_response': response.text}
                response_struct = Struct()
                response_struct.update(response_data)

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
