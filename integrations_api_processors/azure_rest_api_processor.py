import logging

import requests

logger = logging.getLogger(__name__)


class AzureRestApiProcessorProcessor:
    client = None

    def __init__(self, subscription_id, client_id, client_secret, tenant_id):
        self.__subscription_id = subscription_id
        self.__client_id = client_id
        self.__client_secret = client_secret
        self.__tenant_id = tenant_id
        self.__access_token = self.get_access_token()
        if not self.__access_token:
            raise Exception("Azure Connection Error:: Failed to get access token")

    def get_access_token(self):
        token_url = f"https://login.microsoftonline.com/{self.__tenant_id}/oauth2/v2.0/token"
        data = {
            'client_id': self.__client_id,
            'scope': 'https://management.azure.com/.default',
            'client_secret': self.__client_secret,
            'grant_type': 'client_credentials'
        }
        try:
            response = requests.post(token_url, data=data)
            if response.status_code != 200:
                logger.error(f"Failed to get access token with error: {response.text}")
                return None
            access_token = response.json()['access_token']
            return access_token
        except Exception as e:
            logger.error(f"Failed to get access token with error: {e}")
            return None

    def fetch_workspaces(self):
        headers = {
            'Authorization': f'Bearer {self.__access_token}',
            'Content-Type': 'application/json'
        }
        url = f"https://management.azure.com/subscriptions/{self.__subscription_id}/providers/Microsoft.OperationalInsights/workspaces?api-version=2023-09-01"
        try:
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                logger.error(f"Failed to fetch workspaces with error: {response.text}")
                return None
            workspaces = response.json()['value']
            return workspaces
        except Exception as e:
            logger.error(f"Failed to fetch workspaces with error: {e}")
            return None

    def query_log_analytics(self, workspace_id, query):
        headers = {
            'Authorization': f'Bearer {self.__access_token}',
            'Content-Type': 'application/json'
        }
        data = {
            'query': query
        }
        url = f"https://api.loganalytics.io/v1/workspaces/{workspace_id}/query"
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code != 200:
                logger.error(f"Failed to query log analytics with error: {response.text}")
                return None
            results = response.json()
            return results
        except Exception as e:
            logger.error(f"Failed to query log analytics with error: {e}")
            return None
