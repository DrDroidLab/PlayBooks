from connectors.assets.extractor.source_metadata_extractor import SourceMetadataExtractor
from executor.source_processors.bigquery_api_processor import BigQueryApiProcessor
from protos.base_pb2 import SourceModelType

class BigQueryMetadataExtractor(SourceMetadataExtractor):
    def __init__(self, project_id: str, credentials_json: str):
        self.bq_processor = BigQueryApiProcessor(project_id, credentials_json)

    def extract_datasets(self, save_to_db=False):
        model_type = SourceModelType.BIGQUERY_DATASET
        model_data = {}
        try:
            datasets = self.bq_processor.fetch_datasets()
            for dataset in datasets:
                model_data[dataset] = {"dataset_id": dataset}
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, dataset, model_data[dataset])
        except Exception as e:
            print(f'Error extracting BigQuery datasets: {e}')
        return model_data