from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.postgres_db_processor import PostgresDBProcessor
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, ConnectorType


class PostgresConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, host, user, password, database, port=5432, account_id=None, connector_id=None):
        self.__pg_db_processor = PostgresDBProcessor(host, user, password, database, port)

        super().__init__(account_id, connector_id, ConnectorType.POSTGRES)

    def extract_database(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.POSTGRES_DATABASE
        databases = self.__pg_db_processor.fetch_databases()
        if not databases:
            return
        model_data = {}
        for db in databases:
            model_data[db] = {}
            if save_to_db:
                self.create_or_update_model_metadata(model_type, db, {})
        return model_data
