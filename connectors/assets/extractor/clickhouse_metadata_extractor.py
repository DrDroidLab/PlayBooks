from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.clickhouse_db_processor import ClickhouseDBProcessor
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, ConnectorType


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
        try:
            database_tables = self.__ch_db_processor.fetch_tables(databases)
        except Exception as e:
            print(f'Error fetching tables: {e}')
            return
        if not database_tables:
            return
        try:
            database_table_metadata = self.__ch_db_processor.fetch_table_details(database_tables)
        except Exception as e:
            print(f'Error fetching table details: {e}')
            return
        model_data = {}
        for db, metadata in database_table_metadata.items():
            model_data[db] = metadata
            if save_to_db:
                self.create_or_update_model_metadata(model_type, db, metadata)
        return model_data
