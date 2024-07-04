from typing import Union
from django.http import HttpResponse
import os

from playbooks.utils.decorators import web_api
from protos.accounts.api_pb2 import GetUserRequest, GetVersionInfoResponse

@web_api(GetUserRequest)
def version_info(request_message: GetUserRequest) -> Union[GetVersionInfoResponse, HttpResponse]:
    BUILD_TIMESTAMP = os.environ.get('BUILD_TIMESTAMP')
    IMAGE_VERSION = os.environ.get('IMAGE_VERSION')

    should_upgrade = False

    LATEST_VERSION = "latest"

    print(f"BUILD_TIMESTAMP: {BUILD_TIMESTAMP}")
    print(f"IMAGE_VERSION: {IMAGE_VERSION}")

    return GetVersionInfoResponse(current_version=IMAGE_VERSION, latest_version=LATEST_VERSION, should_upgrade=should_upgrade)
                              
