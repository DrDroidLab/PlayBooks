import json

import requests
from google.protobuf.struct_pb2 import Struct

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value, Int64Value, BoolValue
from executor.playbook_source_manager import PlaybookSourceManager
from protos.base_pb2 import Source, TimeRange
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType, Literal
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, ApiResponseResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.api_task_pb2 import Api
from protos.ui_definition_pb2 import FormField, FormFieldType

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
                'executor': self.execute_http_request,
                'model_types': [],
                'result_type': PlaybookTaskResultType.API_RESPONSE,
                'display_name': 'Trigger an API',
                'category': 'Actions',
                'form_fields': [
                    FormField(key_name=StringValue(value="method"),
                              display_name=StringValue(value="Method"),
                              description=StringValue(value='Select Method'),
                              data_type=LiteralType.STRING,
                              valid_values=[
                                  Literal(type=LiteralType.STRING, string=StringValue(value="GET")),
                                  Literal(type=LiteralType.STRING, string=StringValue(value="POST")),
                                  Literal(type=LiteralType.STRING, string=StringValue(value="PUT")),
                                  Literal(type=LiteralType.STRING, string=StringValue(value="PATCH")),
                                  Literal(type=LiteralType.STRING, string=StringValue(value="DELETE"))
                              ],
                              form_field_type=FormFieldType.DROPDOWN_FT
                              ),
                    FormField(key_name=StringValue(value="url"),
                              display_name=StringValue(value="URL"),
                              description=StringValue(value='Enter URL'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TEXT_FT),
                    FormField(key_name=StringValue(value="headers"),
                              display_name=StringValue(value="Headers (Enter JSON)"),
                              data_type=LiteralType.STRING,
                              is_optional=True,
                              form_field_type=FormFieldType.MULTILINE_FT),
                    FormField(key_name=StringValue(value="payload"),
                              display_name=StringValue(value="Payload/Body (Enter JSON)"),
                              data_type=LiteralType.STRING,
                              is_optional=True,
                              form_field_type=FormFieldType.MULTILINE_FT),
                    FormField(key_name=StringValue(value="timeout"),
                              display_name=StringValue(value="Timeout (in seconds)"),
                              description=StringValue(value='Enter Timeout (in seconds)'),
                              data_type=LiteralType.LONG,
                              default_value=Literal(type=LiteralType.LONG, long=Int64Value(value=120)),
                              form_field_type=FormFieldType.TEXT_FT),
                    FormField(key_name=StringValue(value="ssl_verify"),
                              display_name=StringValue(value="SSL Verification"),
                              description=StringValue(value='Enable/Disable SSL Verification'),
                              data_type=LiteralType.BOOLEAN,
                              default_value=Literal(type=LiteralType.BOOLEAN, boolean=BoolValue(value=True)),
                              form_field_type=FormFieldType.TEXT_FT),
                ]
            },
        }

    def execute_http_request(self, time_range: TimeRange, api_task: Api,
                             api_connector_proto: ConnectorProto) -> PlaybookTaskResult:
        try:
            http_request = api_task.http_request
            method = http_request.method
            url = http_request.url.value
            headers = http_request.headers.value
            headers = json.loads(headers) if headers else {}
            if 'Content-Type' not in headers:
                headers['Content-Type'] = 'application/json'
            payload = http_request.payload.value
            timeout = http_request.timeout.value if http_request.timeout else 120
            cookies = http_request.cookies.value
            cookies = json.loads(cookies) if cookies else None

            ssl_verify = False
            if http_request.ssl_verify and http_request.ssl_verify.value:
                ssl_verify = True

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
                response = requests.request(**request_arguments, verify=ssl_verify)
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
