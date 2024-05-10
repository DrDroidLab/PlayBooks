from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.azure_rest_api_processor import AzureRestApiProcessorProcessor
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, ConnectorType


class AzureRestConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, subscription_id, tenant_id, client_id, client_secret, account_id=None, connector_id=None):
        self.__azure_rest_client = AzureRestApiProcessorProcessor(subscription_id, tenant_id, client_id, client_secret)
        super().__init__(account_id, connector_id, ConnectorType.CLICKHOUSE)

    def extract_workspaces(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.AZURE_WORKSPACE
        try:
            workspaces = self.__azure_rest_client.fetch_workspaces()
        except Exception as e:
            print(f'Error fetching databases: {e}')
            return
        if not workspaces:
            return
        model_data = {}
        for w in workspaces:
            workspace_id = w.get('properties', {}).get('customerId')
            model_data[workspace_id] = w
            if save_to_db:
                self.create_or_update_model_metadata(model_type, workspace_id, w)
        return model_data
