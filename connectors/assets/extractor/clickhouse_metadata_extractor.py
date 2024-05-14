from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.clickhouse_db_processor import ClickhouseDBProcessor
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class ClickhouseConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, interface, host, port, user, password, account_id=None, connector_id=None):
        self.__ch_db_processor = ClickhouseDBProcessor(interface, host, port, user, password)

        super().__init__(account_id, connector_id, ConnectorType.CLICKHOUSE)

    def extract_database(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.CLICKHOUSE_DATABASE
        try:
            databases = self.__ch_db_processor.fetch_databases()
        except Exception as e:
            print(f'Error fetching databases: {e}')
            return
        if not databases:
            return
        model_data = {}
        for db in databases:
            model_data[db] = {}
            if save_to_db:
                self.create_or_update_model_metadata(model_type, db, {})
        return model_data
