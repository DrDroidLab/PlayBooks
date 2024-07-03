from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.elastic_search_api_processor import ElasticSearchApiProcessor
from protos.base_pb2 import Source, SourceModelType


class ElasticSearchSourceMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, host: str, port: str, api_key_id: str, api_key: str, account_id=None, connector_id=None):
        self.__es_api_processor = ElasticSearchApiProcessor(host, port, api_key_id, api_key)

        super().__init__(account_id, connector_id, Source.ELASTIC_SEARCH)

    def extract_index(self, save_to_db=False):
        model_type = SourceModelType.ELASTIC_SEARCH_INDEX
        try:
            indexes = self.__es_api_processor.fetch_indices()
        except Exception as e:
            print(f'Error fetching databases: {e}')
            return
        if not indexes:
            return
        model_data = {}
        for ind in indexes:
            model_data[ind] = {}
            if save_to_db:
                self.create_or_update_model_metadata(model_type, ind, {})
        return model_data
