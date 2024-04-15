import logging

import clickhouse_connect

logger = logging.getLogger(__name__)


class ClickhouseDBProcessor:
    client = None

    def __init__(self, interface, host, port, user, password, database=None):
        config = {
            'interface': interface,
            'host': host,
            'port': int(port),
            'user': user,
            'password': password,
            'database': database
        }
        try:
            self.__client = clickhouse_connect.get_client(**config)
        except Exception as e:
            logger.error(f"Exception occurred while connecting to clickhouse with error: {e}")
            raise e

    def test_connection(self):
        try:
            query = 'SELECT 1'
            result = self.__client.query(query)
            if result:
                return True
            return False
        except Exception as e:
            logger.error(f"Exception occurred while testing clickhouse connection with error: {e}")
            raise e

    def fetch_databases(self):
        try:
            db_databases = []
            databases = self.__client.query('SHOW DATABASES')
            for database in databases.result_set:
                if database[0] not in ['system', 'INFORMATION_SCHEMA', 'information_schema']:
                    db_databases.append(database[0])
            return db_databases
        except Exception as e:
            logger.error(f"Exception occurred while fetching clickhouse databases with error: {e}")
            raise e

    def fetch_tables(self, databases: []):
        try:
            database_tables = {}
            for database in databases:
                tables = self.__client.query(f'SHOW TABLES FROM {database}')
                db_tables = []
                for table in tables.result_set:
                    db_tables.append(table[0])
                database_tables[database] = db_tables
            return database_tables
        except Exception as e:
            logger.error(f"Exception occurred while fetching clickhouse tables with error: {e}")
            raise e

    def fetch_table_details(self, database_table_details):
        try:
            database_table_metadata = {}
            for database, tables in database_table_details.items():
                database_tables = []
                for table in tables:
                    table_details = {}
                    details = self.__client.query(f'DESCRIBE TABLE {database}.{table}')
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
            return database_table_metadata
        except Exception as e:
            logger.error(f"Exception occurred while fetching clickhouse table details with error: {e}")
            raise e

    def get_query_result(self, query):
        try:
            result = self.__client.query(query)
            return result
        except Exception as e:
            logger.error(f"Exception occurred while fetching clickhouse query result with error: {e}")
            raise e
