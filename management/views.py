from typing import Union
from django.http import HttpResponse
import os

import requests

from playbooks.utils.decorators import web_api
from protos.accounts.api_pb2 import GetUserRequest, GetVersionInfoResponse

REPO_OWNER = "DrDroidLab"
REPO_NAME = "PlayBooks"

def get_tags():
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/tags"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch tags: {response.status_code}")

def get_commit_date(sha):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits/{sha}"
    response = requests.get(url)
    
    if response.status_code == 200:
        commit_data = response.json()
        commit_date = commit_data['commit']['committer']['date']
        return commit_date
    else:
        raise Exception(f"Failed to fetch commit data: {response.status_code}")
    
def get_latest_tag():
    tags = get_tags()
    
    latest_tag = None
    latest_date = None

    for tag in tags:
        commit_date = get_commit_date(tag['commit']['sha'])
        if latest_date is None or commit_date > latest_date:
            latest_date = commit_date
            latest_tag = tag['name']

    return latest_tag, latest_date

def get_last_commit_timestamp():
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits/main"
    response = requests.get(url)
    
    if response.status_code == 200:
        commit_data = response.json()
        commit_timestamp = commit_data['commit']['committer']['date']
        return commit_timestamp
    else:
        raise Exception(f"Failed to fetch data: {response.status_code}")

@web_api(GetUserRequest)
def version_info(request_message: GetUserRequest) -> Union[GetVersionInfoResponse, HttpResponse]:
    BUILD_TIMESTAMP = os.environ.get('BUILD_TIMESTAMP')
    IMAGE_VERSION = os.environ.get('IMAGE_VERSION')

    should_upgrade = False
    upgrade_message = None
    latest_version = None

    print(f"BUILD_TIMESTAMP: {BUILD_TIMESTAMP}")
    print(f"IMAGE_VERSION: {IMAGE_VERSION}")

    if BUILD_TIMESTAMP is not None:
        LATEST_TIMESTAMP = get_last_commit_timestamp()
        if LATEST_TIMESTAMP > BUILD_TIMESTAMP:
            should_upgrade = True
            upgrade_message = 'New version available!'

    if IMAGE_VERSION is not None:
        LATEST_TAG, LATEST_TAG_TIMESTAMP = get_latest_tag()
        if LATEST_TAG_TIMESTAMP > BUILD_TIMESTAMP:
            should_upgrade = True
            latest_version = LATEST_TAG
            upgrade_message = f'New Release Available - {LATEST_TAG}'

    return GetVersionInfoResponse(current_version=IMAGE_VERSION, latest_version=latest_version, 
                                  should_upgrade=should_upgrade, upgrade_message=upgrade_message)
                              
