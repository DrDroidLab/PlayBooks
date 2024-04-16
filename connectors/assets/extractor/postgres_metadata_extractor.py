from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.postgres_db_processor import PostgresDBProcessor
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, ConnectorType


class PostgresConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, host, user, password, account_id=None, connector_id=None):
        self.__pg_db_processor = PostgresDBProcessor(host, user, password)

        super().__init__(account_id, connector_id, ConnectorType.POSTGRES)

    def extract_database(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.POSTGRES_DATABASE
        databases = self.__pg_db_processor.fetch_databases()
        if not databases:
            return
        database_table_metadata = self.__pg_db_processor.fetch_tables(databases)
        if not database_table_metadata:
            return
        model_data = {}
        for db, metadata in database_table_metadata.items():
            model_data[db] = metadata
            if save_to_db:
                self.create_or_update_model_metadata(model_type, db, metadata)
        return model_data
