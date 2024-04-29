import logging

from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)


class DBConnectionStringProcessor:
    client = None

    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def test_connection(self):
        try:
            engine = create_engine(self.connection_string)
            connection = engine.connect()
            result = connection.execute(text("SELECT 1"))
            return True
        except Exception as e:
            logger.error(f"Exception occurred while testing db connection connection with error: {e}")
            raise e

    def get_query_result(self, query):
        try:
            engine = create_engine(self.connection_string)
            connection = engine.connect()
            result = connection.execute(text(query))
            return result
        except Exception as e:
            logger.error(f"Exception occurred while fetching postgres databases with error: {e}")
            raise e
