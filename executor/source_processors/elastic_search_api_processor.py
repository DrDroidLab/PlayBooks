import logging

from elasticsearch import Elasticsearch

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class ElasticSearchApiProcessor(Processor):
    client = None

    def __init__(self, host: str, port: str, api_key_id: str, api_key: str, ssl_verify='true'):
        self.host = host
        self.port = int(port) if port else 9200
        self.__api_key_id = api_key_id
        self.__api_key = api_key
        self.__ssl_verify = False if ssl_verify and ssl_verify.lower() == 'false' else True

    def get_connection(self):
        try:
            client = Elasticsearch(
                [f"{self.host}:{self.port}"],
                api_key=(self.__api_key_id, self.__api_key),
                verify_certs=self.__ssl_verify
            )
            return client
        except Exception as e:
            logger.error(f"Exception occurred while creating elasticsearch connection with error: {e}")
            raise e

    def test_connection(self):
        try:
            connection = self.get_connection()
            indices = connection.indices.get_alias()
            connection.close()
            return len(list(indices.keys())) >= 0
        except Exception as e:
            logger.error(f"Exception occurred while fetching elasticsearch indices with error: {e}")
            raise e

    def fetch_indices(self):
        try:
            connection = self.get_connection()
            indices = connection.indices.get_alias()
            connection.close()
            return list(indices.keys())
        except Exception as e:
            logger.error(f"Exception occurred while fetching elasticsearch indices with error: {e}")
            raise e

    def query(self, index, query):
        try:
            connection = self.get_connection()
            result = connection.search(index=index, body=query, pretty=True)
            connection.close()
            return result
        except Exception as e:
            logger.error(f"Exception occurred while fetching elasticsearch data with error: {e}")
            raise e

    def get_document(self, index, doc_id):
        try:
            connection = self.get_connection()
            result = connection.get(index=index, id=doc_id, pretty=True, preference="_primary_first")
            connection.close()
            return result
        except Exception as e:
            logger.error(f"Exception occurred while fetching elasticsearch data with error: {e}")
            raise e
