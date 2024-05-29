from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.azure_api_processor import AzureApiProcessor
from protos.base_pb2 import Source, SourceModelType


class AzureConnectorMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, subscription_id, tenant_id, client_id, client_secret, account_id=None, connector_id=None):
        self.__client = AzureApiProcessor(subscription_id, tenant_id, client_id, client_secret)
        super().__init__(account_id, connector_id, Source.AZURE)

    def extract_workspaces(self, save_to_db=False):
        model_type = SourceModelType.AZURE_WORKSPACE
        try:
            workspaces = self.__client.fetch_workspaces()
        except Exception as e:
            print(f'Error fetching databases: {e}')
            return
        if not workspaces:
            return
        model_data = {}
        for w in workspaces:
            workspace_id = w.get('customer_id', '')
            model_data[workspace_id] = w
            if save_to_db:
                self.create_or_update_model_metadata(model_type, workspace_id, w)
        return model_data
