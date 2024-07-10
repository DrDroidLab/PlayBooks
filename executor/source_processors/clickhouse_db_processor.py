import logging

import clickhouse_connect

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class ClickhouseDBProcessor(Processor):
    def __init__(self, interface, host, port, user, password, database=None):
        self.config = {
            'interface': interface,
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'database': database
        }

    def get_connection(self):
        try:
            client = clickhouse_connect.get_client(**self.config)
            return client
        except Exception as e:
            logger.error(f"Exception occurred while creating clickhouse connection with error: {e}")
            raise e

    def test_connection(self):
        try:
            client = self.get_connection()
            query = 'SELECT 1'
            result = client.query(query)
            client.close()
            if result:
                return True
            return False
        except Exception as e:
            logger.error(f"Exception occurred while testing clickhouse connection with error: {e}")
            raise e

    def fetch_databases(self):
        try:
            db_databases = []
            client = self.get_connection()
            databases = client.query('SHOW DATABASES')
            for database in databases.result_set:
                if database[0] not in ['system', 'INFORMATION_SCHEMA', 'information_schema']:
                    db_databases.append(database[0])
            client.close()
            return db_databases
        except Exception as e:
            logger.error(f"Exception occurred while fetching clickhouse databases with error: {e}")
            raise e

    def fetch_tables(self, databases: []):
        try:
            database_tables = {}
            client = self.get_connection()
            for database in databases:
                tables = client.query(f'SHOW TABLES FROM {database}')
                db_tables = []
                for table in tables.result_set:
                    db_tables.append(table[0])
                database_tables[database] = db_tables
            client.close()
            return database_tables
        except Exception as e:
            logger.error(f"Exception occurred while fetching clickhouse tables with error: {e}")
            raise e

    def fetch_table_details(self, database_table_details):
        try:
            database_table_metadata = {}
            client = self.get_connection()
            for database, tables in database_table_details.items():
                database_tables = []
                for table in tables:
                    table_details = {}
                    details = client.query(f'DESCRIBE TABLE {database}.{table}')
                    columns = details.column_names
                    db_columns = []
                    for row in details.result_set:
                        column_details = {}
                        for i, column in enumerate(columns):
                            column_details[column] = row[i]
                        db_columns.append(column_details)
                    table_details[table] = db_columns
                    database_tables.append(table_details)

                database_table_metadata_dict = {}
                for db_tables in database_tables:
                    for table, columns in db_tables.items():
                        database_table_metadata_dict[table] = columns
                database_table_metadata[database] = database_table_metadata_dict
            client.close()
            return database_table_metadata
        except Exception as e:
            logger.error(f"Exception occurred while fetching clickhouse table details with error: {e}")
            raise e

    def get_query_result(self, query, timeout=None):
        try:
            client = self.get_connection()
            result = client.query(query, settings={'max_execution_time': timeout})
            client.close()
            return result
        except Exception as e:
            logger.error(f"Exception occurred while fetching clickhouse query result with error: {e}")
            raise e
