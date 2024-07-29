# Generated by CodiumAI

# Dependencies:
# pip install pytest
from unittest import mock
from django.test import TestCase
from executor.source_processors.clickhouse_db_processor import ClickhouseDBProcessor

class TestClickhouseDBProcessor(TestCase):

    # Successfully establish a connection to Clickhouse using valid credentials
    @mock.patch('clickhouse_connect.get_client')
    def test_successful_connection(self, mock_get_client):
        mock_client = mock.Mock()
        mock_get_client.return_value = mock_client
    
        processor = ClickhouseDBProcessor(interface='http', host='localhost', port=8123, user='default', password='password')
        connection = processor.get_connection()
    
        self.assertEqual(connection, mock_client, msg="Connection object returned by the processor is not the same as the mock client")

    # Handle invalid credentials and raise appropriate exceptions
    @mock.patch('executor.source_processors.clickhouse_db_processor.logger')
    @mock.patch('clickhouse_connect.get_client', side_effect=Exception("Invalid credentials"))
    def test_invalid_credentials(self, mock_get_client, mock_logger):
        processor = ClickhouseDBProcessor(interface='http', host='localhost', port=8123, user='default', password='wrong_password')
    
        with self.assertRaises(Exception) as context:
            processor.get_connection()
    
        self.assertEqual(str(context.exception), "Invalid credentials")
        mock_logger.error.assert_called_once_with("Exception occurred while creating clickhouse connection with error: Invalid credentials")

    # Retrieve a list of tables from specified databases
    @mock.patch('clickhouse_connect.get_client')
    def test_retrieve_tables_from_databases(self, mock_get_client):
        mock_client = mock.Mock()
        mock_get_client.return_value = mock_client

        mock_query_result_db1 = mock.Mock()
        mock_query_result_db1.result_set = [('table1', ), ('table2', )]

        mock_query_result_db2 = mock.Mock()
        mock_query_result_db2.result_set = [('table3', ), ('table4', )]
        mock_client.query.side_effect = [mock_query_result_db1, mock_query_result_db2]
        
        processor = ClickhouseDBProcessor(interface='http', host='localhost', port=8123, user='default', password='password')
        databases = ['db1', 'db2']
        tables = processor.fetch_tables(databases)
    
        self.assertEqual(tables, {'db1': ['table1', 'table2'], 'db2': ['table3', 'table4']}, msg="Tables returned by the processor do not match the expected result")

    # Retrieve a list of databases excluding system databases
    @mock.patch('clickhouse_connect.get_client')
    def test_retrieve_databases_excluding_system_databases(self, mock_get_client):
        mock_client = mock.Mock()
        mock_query_result = mock.Mock()
        mock_query_result.result_set = [('db1',), ('db2',), ('system',), ('INFORMATION_SCHEMA',)]
        mock_client.query.return_value = mock_query_result
        mock_get_client.return_value = mock_client

        processor = ClickhouseDBProcessor(interface='http', host='localhost', port=8123, user='default', password='password')
        databases = processor.fetch_databases()

        self.assertEqual(databases, ['db1', 'db2'], msg="Databases returned by the processor do not match the expected result")

    # Execute a query and return the result within the specified timeout
    @mock.patch('clickhouse_connect.get_client')
    def test_execute_query_within_timeout(self, mock_get_client):
        mock_client = mock.Mock()
        mock_get_client.return_value = mock_client
    
        processor = ClickhouseDBProcessor(interface='http', host='localhost', port=8123, user='default', password='password')
        query = 'SELECT * FROM table'
        timeout = 60
        mock_client.query.return_value = (1, "Mocked Result", 2)

        result = processor.get_query_result(query, timeout)

        self.assertEqual(result, (1, "Mocked Result", 2), msg="Query result returned by the processor does not match the expected result")

    # Fetch detailed metadata for tables in specified databases
    @mock.patch('clickhouse_connect.get_client')
    def test_fetch_table_details_success(self, mock_get_client):
        mock_client = mock.Mock()
        mock_get_client.return_value = mock_client
    
        processor = ClickhouseDBProcessor(interface='http', host='localhost', port=8123, user='default', password='password')
        database_table_details = {'database1': ['table1', 'table2'], 'database2': ['table3']}
        expected_result = {'database1': {'table1': [{'column1': 'type1', 'column2': 'type2'}], 'table2': [{'column3': 'type3'}]}, 'database2': {'table3': [{'column4': 'type4'}]}}
    
        mock_query_result_db1_table_1 = mock.Mock()
        mock_query_result_db1_table_1.column_names = ['column1', 'column2']
        mock_query_result_db1_table_1.result_set = [('type1', 'type2')]

        mock_query_result_db1_table_2 = mock.Mock()
        mock_query_result_db1_table_2.column_names = ['column3']
        mock_query_result_db1_table_2.result_set = [('type3',)]

        mock_query_result_db2_table_3 = mock.Mock()
        mock_query_result_db2_table_3.column_names = ['column4']
        mock_query_result_db2_table_3.result_set = [('type4',)]

        mock_client.query.side_effect = [mock_query_result_db1_table_1, mock_query_result_db1_table_2, mock_query_result_db2_table_3]
    
        result = processor.fetch_table_details(database_table_details)
    
        self.assertEqual(result, expected_result, msg="Table details returned by the processor do not match the expected result")