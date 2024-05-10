import logging
import os
from datetime import timedelta

from azure.identity import DefaultAzureCredential
from azure.mgmt.loganalytics import LogAnalyticsManagementClient
from azure.monitor.query import LogsQueryClient

logger = logging.getLogger(__name__)


def query_response_to_dict(response):
    """
    Function to convert query response tables to dictionaries.
    """
    result = {}
    for table in response:
        result[table.name] = []
        for row in table.rows:
            row_dict = {}
            for i, column in enumerate(table.columns):
                row_dict[column.name] = row[i]
            result[table.name].append(row_dict)
    return result


class AzureApiProcessor:
    client = None

    def __init__(self, subscription_id, tenant_id, client_id, client_secret):
        self.__subscription_id = subscription_id
        self.__client_id = client_id
        self.__client_secret = client_secret
        self.__tenant_id = tenant_id

        if not self.__client_id or not self.__client_secret or not self.__tenant_id:
            raise Exception("Azure Connection Error:: Missing client_id, client_secret, or tenant_id")

    def get_credentials(self):
        """
        Function to fetch Azure credentials using client_id, client_secret, and tenant_id.
        """
        os.environ['AZURE_CLIENT_ID'] = self.__client_id
        os.environ['AZURE_CLIENT_SECRET'] = self.__client_secret
        os.environ['AZURE_TENANT_ID'] = self.__tenant_id
        credential = DefaultAzureCredential()
        return credential

    def fetch_workspaces(self):
        try:
            credentials = self.get_credentials()
            if not credentials:
                logger.error("Azure Connection Error:: Failed to get credentials")
                return None
            log_analytics_client = LogAnalyticsManagementClient(credentials, self.__subscription_id)
            workspaces = log_analytics_client.workspaces.list()
            if not workspaces:
                logger.error("Azure Connection Error:: No Workspaces Found")
                return None
            return [workspace.as_dict() for workspace in workspaces]
        except Exception as e:
            logger.error(f"Failed to fetch workspaces with error: {e}")
            return None

    def query_log_analytics(self, workspace_id, query, timespan=timedelta(hours=4)):
        try:
            credentials = self.get_credentials()
            if not credentials:
                logger.error("Azure Connection Error:: Failed to get credentials")
                return None
            client = LogsQueryClient(credentials)
            response = client.query_workspace(workspace_id, query, timespan=timespan)
            if not response:
                logger.error(f"Failed to query log analytics with error: {response.text}")
                return None
            results = query_response_to_dict(response)
            return results
        except Exception as e:
            logger.error(f"Failed to query log analytics with error: {e}")
            return None
