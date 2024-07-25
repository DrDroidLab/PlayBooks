from datetime import datetime

import pytz
from google.protobuf.wrappers_pb2 import StringValue, DoubleValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.aws_boto_3_api_processor import AWSBoto3ApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType, Literal
from protos.playbooks.playbook_commons_pb2 import TimeseriesResult, LabelValuePair, PlaybookTaskResult, \
    PlaybookTaskResultType, TableResult
from protos.playbooks.source_task_definitions.cloudwatch_task_pb2 import Cloudwatch
from protos.ui_definition_pb2 import FormField, FormFieldType


class CloudwatchSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.CLOUDWATCH
        self.task_proto = Cloudwatch
        self.task_type_callable_map = {
            Cloudwatch.TaskType.METRIC_EXECUTION: {
                'executor': self.execute_metric_execution,
                'model_types': [SourceModelType.CLOUDWATCH_METRIC],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a Metric from Cloudwatch',
                'category': 'Metrics',
                'form_fields': [
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN),
                    FormField(key_name=StringValue(value="region"),
                              display_name=StringValue(value="Region"),
                              description=StringValue(value='Select Region'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN),
                    FormField(key_name=StringValue(value="dimensions"),
                              display_name=StringValue(value="Dimensions"),
                              description=StringValue(value='Select Dimension Name'),
                              is_composite=True,
                              composite_fields=[
                                  FormField(key_name=StringValue(value="name"),
                                            display_name=StringValue(value="Dimension Name"),
                                            description=StringValue(value='Select Dimension Name'),
                                            data_type=LiteralType.STRING,
                                            form_field_type=FormFieldType.TYPING_DROPDOWN),
                                  FormField(key_name=StringValue(value="value"),
                                            display_name=StringValue(value="Dimension Value"),
                                            description=StringValue(value='Select Dimension Value'),
                                            data_type=LiteralType.STRING,
                                            form_field_type=FormFieldType.TYPING_DROPDOWN)
                              ],
                              form_field_type=FormFieldType.COMPOSITE),
                    FormField(key_name=StringValue(value="metric_name"),
                              display_name=StringValue(value="Metric"),
                              description=StringValue(value='Add Metric'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_MULTIPLE),
                    FormField(key_name=StringValue(value="statistic"),
                              display_name=StringValue(value="Metric Aggregation"),
                              description=StringValue(value='Select Aggregation Function'),
                              data_type=LiteralType.STRING,
                              default_value=Literal(type=LiteralType.STRING, string=StringValue(value="Average")),
                              valid_values=[Literal(type=LiteralType.STRING, string=StringValue(value="Average")),
                                            Literal(type=LiteralType.STRING, string=StringValue(value="Sum")),
                                            Literal(type=LiteralType.STRING, string=StringValue(value="SampleCount")),
                                            Literal(type=LiteralType.STRING, string=StringValue(value="Maximum")),
                                            Literal(type=LiteralType.STRING, string=StringValue(value="Minimum"))],
                              form_field_type=FormFieldType.DROPDOWN),
                ]
            },
            Cloudwatch.TaskType.FILTER_LOG_EVENTS: {
                'executor': self.execute_filter_log_events,
                'model_types': [SourceModelType.CLOUDWATCH_LOG_GROUP],
                'result_type': PlaybookTaskResultType.LOGS,
                'display_name': 'Fetch Logs from Cloudwatch',
                'category': 'Logs',
                'form_fields': [
                    FormField(key_name=StringValue(value="region"),
                              display_name=StringValue(value="Region"),
                              description=StringValue(value='Select Region'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN),
                    FormField(key_name=StringValue(value="log_group_name"),
                              display_name=StringValue(value="Log Group"),
                              description=StringValue(value='Select Log Group'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN),
                    FormField(key_name=StringValue(value="filter_query"),
                              display_name=StringValue(value="Filter Query"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.MULTILINE)
                ]
            },
        }

    def get_connector_processor(self, cloudwatch_connector, **kwargs):
        generated_credentials = generate_credentials_dict(cloudwatch_connector.type, cloudwatch_connector.keys)
        generated_credentials['client_type'] = kwargs.get('client_type', 'cloudwatch')
        if 'region' in kwargs:
            generated_credentials['region'] = kwargs.get('region')
        return AWSBoto3ApiProcessor(**generated_credentials)

    def test_connector_processor(self, connector: ConnectorProto, **kwargs):
        cw_processor = self.get_connector_processor(connector, client_type='cloudwatch')
        cw_logs_processor = self.get_connector_processor(connector, client_type='logs')
        try:
            return cw_processor.test_connection() and cw_logs_processor.test_connection()
        except Exception as e:
            raise e

    def execute_metric_execution(self, time_range: TimeRange, cloudwatch_task: Cloudwatch,
                                 cloudwatch_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not cloudwatch_connector:
                raise Exception("Task execution Failed:: No Cloudwatch source found")

            task_result = PlaybookTaskResult()

            tr_end_time = time_range.time_lt
            end_time = datetime.utcfromtimestamp(tr_end_time)
            tr_start_time = time_range.time_geq
            start_time = datetime.utcfromtimestamp(tr_start_time)
            period = 300

            task = cloudwatch_task.metric_execution
            region = task.region.value
            metric_name = task.metric_name.value
            namespace = task.namespace.value
            statistic = ['Average']
            requested_statistic = 'Average'
            if task.statistic and task.statistic.value in ['Average', 'Sum', 'SampleCount', 'Maximum', 'Minimum']:
                statistic = [task.statistic.value]
                requested_statistic = task.statistic.value
            task_dimensions = task.dimensions
            dimensions = []
            for td in task_dimensions:
                dimensions.append({'Name': td.name.value, 'Value': td.value.value})

            cloudwatch_boto3_processor = self.get_connector_processor(cloudwatch_connector, client_type='cloudwatch',
                                                                      region=region)

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Region -> {}, Namespace -> {}, Metric -> {}, Start_Time "
                "-> {}, End_Time -> {}, Period -> {}, Statistic -> {}, Dimensions -> {}".format(
                    "Cloudwatch_Metrics", cloudwatch_connector.account_id.value, region, namespace, metric_name,
                    start_time,
                    end_time, period, statistic, dimensions), flush=True)

            response = cloudwatch_boto3_processor.cloudwatch_get_metric_statistics(namespace, metric_name,
                                                                                   start_time, end_time,
                                                                                   period, statistic, dimensions)
            if not response or not response['Datapoints']:
                raise Exception("No data returned from Cloudwatch")
            response_datapoints = response['Datapoints']
            if len(response_datapoints) > 0:
                metric_unit = response_datapoints[0]['Unit']
            else:
                metric_unit = ''

            metric_datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
            for item in response_datapoints:
                utc_timestamp = str(item['Timestamp'])
                utc_datetime = datetime.fromisoformat(utc_timestamp)
                utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                val = item[requested_statistic]
                datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                    timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                metric_datapoints.append(datapoint)

            labeled_metric_timeseries = [TimeseriesResult.LabeledMetricTimeseries(
                metric_label_values=[
                    LabelValuePair(name=StringValue(value='namespace'), value=StringValue(value=namespace)),
                    LabelValuePair(name=StringValue(value='statistic'),
                                   value=StringValue(value=requested_statistic)),
                ],
                unit=StringValue(value=metric_unit),
                datapoints=metric_datapoints
            )]
            metric_metadata = f"{namespace} for region {region} "
            for i in dimensions:
                metric_metadata += f"{i['Name']}:{i['Value']},  "
            timeseries_result = TimeseriesResult(metric_expression=StringValue(value=metric_name),
                                                 metric_name=StringValue(value=metric_metadata),
                                                 labeled_metric_timeseries=labeled_metric_timeseries)

            task_result = PlaybookTaskResult(type=PlaybookTaskResultType.TIMESERIES, timeseries=timeseries_result,
                                             source=self.source)
            return task_result
        except Exception as e:
            raise Exception(f"Error while executing Cloudwatch task: {e}")

    def execute_filter_log_events(self, time_range: TimeRange, cloudwatch_task: Cloudwatch,
                                  cloudwatch_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not cloudwatch_connector:
                raise Exception("Task execution Failed:: No Cloudwatch source found")
            tr_end_time = time_range.time_lt
            end_time = int(tr_end_time * 1000)
            tr_start_time = time_range.time_geq
            start_time = int(tr_start_time * 1000)

            task = cloudwatch_task.filter_log_events
            region = task.region.value
            log_group = task.log_group_name.value
            query_pattern = task.filter_query.value

            logs_boto3_processor = self.get_connector_processor(cloudwatch_connector, client_type='logs', region=region)
            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Region -> {}, Log_Group -> {}, Query -> "
                "{}, Start_Time -> {}, End_Time -> {}".format("Cloudwatch_Logs", cloudwatch_connector.account_id.value,
                                                              region, log_group, query_pattern, start_time, end_time),
                flush=True)

            response = logs_boto3_processor.logs_filter_events(log_group, query_pattern, start_time, end_time)
            if not response:
                raise Exception("No data returned from Cloudwatch Logs")

            table_rows: [TableResult.TableRow] = []
            for item in response:
                table_columns: [TableResult.TableColumn] = []
                for i in item:
                    table_column = TableResult.TableColumn(name=StringValue(value=i['field']),
                                                           value=StringValue(value=i['value']))
                    table_columns.append(table_column)
                table_row = TableResult.TableRow(columns=table_columns)
                table_rows.append(table_row)

            result = TableResult(
                raw_query=StringValue(
                    value=f"Execute ```{query_pattern}``` on log group {log_group} in region {region}"),
                rows=table_rows,
                total_count=UInt64Value(value=len(table_rows)),
            )

            task_result = PlaybookTaskResult(type=PlaybookTaskResultType.LOGS, logs=result, source=self.source)
            return task_result
        except Exception as e:
            raise Exception(f"Error while executing Cloudwatch task: {e}")