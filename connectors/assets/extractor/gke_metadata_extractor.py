from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.gke_api_processor import GkeApiProcessor
from protos.base_pb2 import Source, SourceModelType


class GkeSourceMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, project_id, service_account_json, account_id=None, connector_id=None):
        self.__project_id = project_id
        self.__service_account_json = service_account_json
        super().__init__(account_id, connector_id, Source.GKE)

    def extract_clusters(self, save_to_db=False):
        model_data = {}
        gke_api_processor = GkeApiProcessor(self.__project_id, self.__service_account_json)
        model_type = SourceModelType.GKE_CLUSTER
        clusters = gke_api_processor.list_clusters()
        if not clusters:
            return model_data
        for c in clusters:
            clusters = model_data.get(c['zone'], [])
            clusters.append(c)
            model_data[c['zone']] = clusters
        for zone in model_data:
            clusters = model_data[zone]
            if not clusters:
                continue
            model_data[zone] = {'clusters': clusters}
            if save_to_db:
                self.create_or_update_model_metadata(model_type, zone, {'clusters': clusters})
        return model_data
