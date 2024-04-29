import logging

import psycopg2
from psycopg2 import extras

logger = logging.getLogger(__name__)


class PostgresDBProcessor:
    client = None

    def __init__(self, host, user, password, database, port='5432'):
        self.config = {
            'host': host,
            'user': user,
            'password': password,
            'database': database,
            'port': port
        }

    def test_connection(self):
        try:
            client = psycopg2.connect(**self.config)
            cursor = client.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            client.close()
            return True
        except Exception as e:
            logger.error(f"Exception occurred while testing postgres connection with error: {e}")
            raise e

    def fetch_databases(self):
        try:
            all_databases = []
            client = psycopg2.connect(**self.config)
            cursor = client.cursor()
            cursor.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
            databases = cursor.fetchall()
            cursor.close()
            client.close()
            for database in databases:
                all_databases.append(database[0])
            return all_databases
        except Exception as e:
            logger.error(f"Exception occurred while fetching postgres databases with error: {e}")
            raise e

    def fetch_tables(self, databases: []):
        try:
            database_metadata = {}
            for db_name in databases:
                try:
                    client_config = self.config
                    client_config['database'] = db_name
                    client = psycopg2.connect(**client_config)
                    cursor = client.cursor(cursor_factory=extras.DictCursor)
                    cursor.execute(
                        f"SELECT table_name FROM information_schema.tables WHERE table_catalog='{db_name}' AND table_schema='public';")
                    tables = cursor.fetchall()
                    for table_row in tables:
                        table_name = table_row['table_name']

                        cursor.execute(
                            f"SELECT column_name, data_type FROM information_schema.columns WHERE table_catalog='{db_name}' AND table_name='{table_name}';")
                        columns = cursor.fetchall()

                        table_columns = []
                        for column_row in columns:
                            col_dict = {}
                            for col, val in column_row.items():
                                col_dict[col] = val
                            table_columns.append(col_dict)

                        db_table_dict = database_metadata.get(db_name, {})
                        db_table_dict[table_name] = table_columns
                        database_metadata[db_name] = db_table_dict

                    cursor.close()
                    client.close()
                except Exception as e:
                    logger.error(f"Exception occurred while fetching postgres tables with error: {e}")
                    continue
            return database_metadata
        except Exception as e:
            logger.error(f"Exception occurred while fetching postgres databases with error: {e}")
            raise e

    def get_query_result(self, query):
        try:
            if 'database' not in self.config:
                raise Exception("Database not provided in the config")
            client = psycopg2.connect(**self.config)
            cursor = client.cursor(cursor_factory=extras.DictCursor)
            cursor.execute(query)
            result = cursor.fetchall()
            cursor.close()
            client.close()
            return result
        except Exception as e:
            logger.error(f"Exception occurred while fetching postgres databases with error: {e}")
            raise e
