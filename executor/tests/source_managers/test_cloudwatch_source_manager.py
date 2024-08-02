import pytest
import django
from unittest import mock, TestCase
from unittest.mock import MagicMock
from datetime import datetime


django.setup()

from executor.source_managers.cloudwatch_source_manager import CloudwatchSourceManager
from protos.base_pb2 import TimeRange
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType, PlaybookTaskResult


def parse_isoformat_with_z(iso_string):
    try:
        return datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
    except ValueError:
        raise


@pytest.fixture(scope='module', autouse=True)
def django_setup():
    django.setup()


@pytest.fixture
def cloudwatch_source_manager():
    return CloudwatchSourceManager()


class TestCloudwatchSourceManager(TestCase):

    @mock.patch('executor.source_managers.cloudwatch_source_manager.generate_credentials_dict')
    @mock.patch('executor.source_managers.cloudwatch_source_manager.AWSBoto3ApiProcessor')
    def test_get_connector_processor(self, MockAWSBoto3ApiProcessor, mock_generate_credentials_dict):
        mock_generate_credentials_dict.return_value = {'client_type': 'cloudwatch'}
        mock_processor_instance = MockAWSBoto3ApiProcessor.return_value

        cloudwatch_source_manager = CloudwatchSourceManager()
        connector = MagicMock()
        connector.type = 'cloudwatch'
        connector.keys = {}

        processor = cloudwatch_source_manager.get_connector_processor(connector, client_type='cloudwatch',
                                                                      region='us-west-2')
        mock_generate_credentials_dict.assert_called_once_with('cloudwatch', {})
        MockAWSBoto3ApiProcessor.assert_called_once_with(client_type='cloudwatch', region='us-west-2')
        self.assertEqual(processor, mock_processor_instance)

    @mock.patch('executor.source_managers.cloudwatch_source_manager.generate_credentials_dict')
    @mock.patch('executor.source_managers.cloudwatch_source_manager.AWSBoto3ApiProcessor')
    def test_execute_metric_execution_success(self, MockAWSBoto3ApiProcessor, mock_generate_credentials_dict):
        mock_generate_credentials_dict.return_value = {'client_type': 'cloudwatch'}
        mock_processor_instance = MockAWSBoto3ApiProcessor.return_value
        mock_processor_instance.cloudwatch_get_metric_statistics.return_value = {
            'Datapoints': [
                {'Timestamp': parse_isoformat_with_z('2023-01-01T00:00:00Z'), 'Average': 1.0, 'Unit': 'Count'}]
        }

        cloudwatch_source_manager = CloudwatchSourceManager()
        time_range = TimeRange(time_geq=0, time_lt=100)
        cloudwatch_task = MagicMock()
        cloudwatch_task.metric_execution.namespace.value = 'AWS/EC2'
        cloudwatch_task.metric_execution.metric_name.value = 'CPUUtilization'
        cloudwatch_task.metric_execution.region.value = 'us-west-2'
        cloudwatch_task.metric_execution.statistic.value = 'Average'
        cloudwatch_task.metric_execution.dimensions = []

        connector = MagicMock()
        connector.type = 'cloudwatch'
        connector.keys = {}

        result = cloudwatch_source_manager.execute_metric_execution(time_range, cloudwatch_task, connector)
        self.assertIsInstance(result, PlaybookTaskResult)
        self.assertEqual(result.type, PlaybookTaskResultType.TIMESERIES)

    @mock.patch('executor.source_managers.cloudwatch_source_manager.generate_credentials_dict')
    @mock.patch('executor.source_managers.cloudwatch_source_manager.AWSBoto3ApiProcessor')
    def test_execute_filter_log_events_success(self, MockAWSBoto3ApiProcessor, mock_generate_credentials_dict):
        mock_generate_credentials_dict.return_value = {'client_type': 'cloudwatch'}
        mock_processor_instance = MockAWSBoto3ApiProcessor.return_value
        mock_processor_instance.logs_filter_events.return_value = [
            [
                {'field': 'timestamp', 'value': '2023-01-01T00:00:00Z'},
                {'field': 'message', 'value': 'log message 1'},
                {'field': 'logStreamName', 'value': 'stream1'}
            ],
            [
                {'field': 'timestamp', 'value': '2023-01-01T00:00:01Z'},
                {'field': 'message', 'value': 'log message 2'},
                {'field': 'logStreamName', 'value': 'stream2'}
            ]
        ]

        cloudwatch_source_manager = CloudwatchSourceManager()
        time_range = TimeRange(time_geq=0, time_lt=100)
        cloudwatch_task = MagicMock()
        cloudwatch_task.filter_log_events.region.value = 'us-west-2'
        cloudwatch_task.filter_log_events.log_group_name.value = 'log-group'
        cloudwatch_task.filter_log_events.filter_query.value = 'ERROR'

        connector = MagicMock()
        connector.type = 'cloudwatch'
        connector.keys = {}
        connector.account_id.value = 'test-account-id'

        result = cloudwatch_source_manager.execute_filter_log_events(time_range, cloudwatch_task, connector)

        self.assertIsInstance(result, PlaybookTaskResult)
        self.assertEqual(result.type, PlaybookTaskResultType.LOGS)

        # Additional assertions to verify the structure of the result
        self.assertTrue(hasattr(result, 'logs'))
        self.assertTrue(hasattr(result.logs, 'rows'))
        self.assertEqual(len(result.logs.rows), 2)  # Assuming two log entries

        # Check the structure of each log entry
        for row in result.logs.rows:
            self.assertTrue(hasattr(row, 'columns'))
            self.assertEqual(len(row.columns), 3)  # Assuming 3 columns: timestamp, message, logStreamName
            column_names = [col.name.value for col in row.columns]
            self.assertIn('timestamp', column_names)
            self.assertIn('message', column_names)
            self.assertIn('logStreamName', column_names)

        # Verify the raw query
        expected_query = f"Execute ```ERROR``` on log group log-group in region us-west-2"
        self.assertEqual(result.logs.raw_query.value, expected_query)

        # Verify the total count
        self.assertEqual(result.logs.total_count.value, 2)
