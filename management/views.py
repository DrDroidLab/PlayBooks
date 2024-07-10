from datetime import datetime
from typing import Union
from django.http import HttpResponse
import os
import json

import requests

from playbooks.utils.decorators import web_api
from protos.accounts.api_pb2 import GetUserRequest, GetVersionInfoResponse

REPO_OWNER = "DrDroidLab"
REPO_NAME = "PlayBooks"

def get_main_last_commit_timestamp():
    try:
        url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits/main"
        response = requests.get(url)
        
        if response.status_code == 200:
            commit_data = response.json()
            commit_date = commit_data['commit']['committer']['date']
            return commit_date
        else:
            return None
    except:
        return None
    
def get_latest_tag_timestamp():
    latest_tag = None
    latest_date = None

    url = "https://app.drdroid.io/management/version-info"

    payload = json.dumps({})
    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    if response.status_code == 200:
        data = response.json()
        latest_tag = data['latest_version']
        latest_date = int(data['latest_version_timestamp'])

    return latest_tag, latest_date

@web_api(GetUserRequest)
def version_info(request_message: GetUserRequest) -> Union[GetVersionInfoResponse, HttpResponse]:
    BUILD_TIMESTAMP = os.environ.get('BUILD_TIMESTAMP')
    IMAGE_VERSION = os.environ.get('IMAGE_VERSION')

    should_upgrade = False
    upgrade_message = None
    latest_version = None

    if IMAGE_VERSION is not None and BUILD_TIMESTAMP is not None:
        LATEST_TAG, LATEST_TAG_TIMESTAMP = get_latest_tag_timestamp()
        if LATEST_TAG_TIMESTAMP > int(BUILD_TIMESTAMP):
            should_upgrade = True
            latest_version = LATEST_TAG
            upgrade_message = f'Upgrade to {LATEST_TAG}'
    elif BUILD_TIMESTAMP is not None:
        LATEST_TIMESTAMP = get_main_last_commit_timestamp()
        if LATEST_TIMESTAMP:
            print(datetime.strptime(LATEST_TIMESTAMP, '%Y-%m-%dT%H:%M:%SZ').timestamp(), BUILD_TIMESTAMP)
            if datetime.strptime(LATEST_TIMESTAMP, '%Y-%m-%dT%H:%M:%SZ').timestamp() > int(BUILD_TIMESTAMP):
                should_upgrade = True
                upgrade_message = 'Upgrade to Latest Version'

    return GetVersionInfoResponse(current_version=IMAGE_VERSION, latest_version=latest_version, 
                                  should_upgrade=should_upgrade, upgrade_message=upgrade_message)
                              
