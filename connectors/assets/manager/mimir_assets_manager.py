from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.base_pb2 import Source as ConnectorType


class MimirAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = ConnectorType.GRAFANA_MIMIR
