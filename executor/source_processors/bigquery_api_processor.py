import logging
from google.cloud import bigquery
from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)

class BigQueryApiProcessor(Processor):
    client = None

    def __init__(self, project_id: str, credentials_json: str):
        self.project_id = project_id
        self.credentials_json = credentials_json

    def get_connection(self):
        try:
            client = bigquery.Client.from_service_account_json(self.credentials_json, project=self.project_id)
            return client
        except Exception as e:
            logger.error(f"Exception occurred while creating BigQuery connection with error: {e}")
            raise e

    def test_connection(self):
        try:
            connection = self.get_connection()
            datasets = list(connection.list_datasets())
            connection.close()
            if len(datasets) > 0:
                return True
            else:
                raise Exception("BigQuery Connection Error:: No datasets found in BigQuery")
        except Exception as e:
            logger.error(f"Exception occurred while fetching BigQuery datasets with error: {e}")
            raise e

    def fetch_datasets(self):
        try:
            connection = self.get_connection()
            datasets = list(connection.list_datasets())
            connection.close()
            return [dataset.dataset_id for dataset in datasets]
        except Exception as e:
            logger.error(f"Exception occurred while fetching BigQuery datasets with error: {e}")
            raise e

    def query(self, query):
        try:
            connection = self.get_connection()
            query_job = connection.query(query)
            result = query_job.result()
            connection.close()
            return result
        except Exception as e:
            logger.error(f"Exception occurred while executing BigQuery query with error: {e}")
            raise e

    def get_table(self, dataset_id, table_id):
        try:
            connection = self.get_connection()
            table = connection.get_table(f"{self.project_id}.{dataset_id}.{table_id}")
            connection.close()
            return table
        except Exception as e:
            logger.error(f"Exception occurred while fetching BigQuery table with error: {e}")
            raise e