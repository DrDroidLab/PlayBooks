from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, ConnectorType


class RemoteServerConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, remote_host, remote_user, remote_password, remote_pem, account_id=None, connector_id=None):
        self.__remote_host = remote_host
        self.__remote_user = remote_user
        self.__remote_password = remote_password
        self.__remote_pem = remote_pem

        super().__init__(account_id, connector_id, ConnectorType.REMOTE_SERVER)

    def extract_remote_server(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.SSH_SERVER
        key = f'{self.__remote_user}@{self.__remote_host}'
        if self.__remote_password:
            value = {'password': self.__remote_password}
            model_data = {key: value}
        elif self.__remote_pem:
            value = {'pem': self.__remote_pem}
            model_data = {key: value}
        else:
            value = {}
            model_data = {key: value}
        if save_to_db:
            self.create_or_update_model_metadata(model_type, key, value)
        return model_data
