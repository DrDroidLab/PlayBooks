import logging

from executor.source_processors.jira_api_processor import JiraApiProcessor
from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from protos.base_pb2 import Source, SourceModelType
from utils.logging_utils import log_function_call

logger = logging.getLogger(__name__)


class JiraSourceMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, jira_cloud_api_key, jira_domain, jira_email, account_id=None, connector_id=None):
        self.jira_processor = JiraApiProcessor(jira_cloud_api_key, jira_domain, jira_email)
        super().__init__(account_id, connector_id, Source.JIRA_CLOUD)

    @log_function_call
    def extract_projects(self, save_to_db=False):
        model_data = {}
        model_type = SourceModelType.JIRA_PROJECT
        try:
            projects = self.jira_processor.list_all_projects()
            if not projects:
                return model_data
            for project in projects:
                model_data[project['key']] = project
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, project['key'], project)
        except Exception as e:
            logger.error(f'Error extracting Jira projects: {e}')
        return model_data

    @log_function_call
    def extract_users(self, save_to_db=False):
        model_data = {}
        model_type = SourceModelType.JIRA_USER
        try:
            users = self.jira_processor.list_all_users()
            if not users:
                return model_data
            for user in users:
                if 'accountType' in user and user['accountType'] == 'atlassian':
                    model_data[user['accountId']] = user
                    if save_to_db:
                        self.create_or_update_model_metadata(model_type, user['accountId'], user)
        except Exception as e:
            logger.error(f'Error extracting Jira users: {e}')
        return model_data
