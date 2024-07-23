from datetime import datetime
from typing import Dict

import pytz
from google.protobuf.wrappers_pb2 import StringValue, DoubleValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.aws_boto_3_api_processor import AWSBoto3ApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import TimeseriesResult, LabelValuePair, PlaybookTaskResult, \
    PlaybookTaskResultType, TableResult
from protos.playbooks.source_task_definitions.cloudwatch_task_pb2 import Cloudwatch


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
                'category': 'Metrics'
            },
            Cloudwatch.TaskType.FILTER_LOG_EVENTS: {
                'executor': self.execute_filter_log_events,
                'model_types': [SourceModelType.CLOUDWATCH_LOG_GROUP],
                'result_type': PlaybookTaskResultType.LOGS,
                'display_name': 'Fetch Logs from Cloudwatch',
                'category': 'Logs'
            },
        }

    def get_connector_processor(self, cloudwatch_connector, **kwargs):
        generated_credentials = generate_credentials_dict(cloudwatch_connector.type, cloudwatch_connector.keys)
        if 'regions' in generated_credentials:
            generated_credentials.pop('regions', None)
        generated_credentials['region'] = kwargs.get('region')
        generated_credentials['client_type'] = kwargs.get('client_type')
        return AWSBoto3ApiProcessor(**generated_credentials)

    def execute_metric_execution(self, time_range: TimeRange, global_variable_set: Dict, cloudwatch_task: Cloudwatch,
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

            cloudwatch_boto3_processor = self.get_connector_processor(cloudwatch_connector, region=region,
                                                                      client_type='cloudwatch')

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
            process_function = task.process_function.value
            if process_function == 'timeseries':
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

    def execute_filter_log_events(self, time_range: TimeRange, global_variable_set: Dict, cloudwatch_task: Cloudwatch,
                                  cloudwatch_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not cloudwatch_connector:
                raise Exception("Task execution Failed:: No Cloudwatch source found")
            task_result = PlaybookTaskResult()
            tr_end_time = time_range.time_lt
            end_time = int(tr_end_time * 1000)
            tr_start_time = time_range.time_geq
            start_time = int(tr_start_time * 1000)

            task = cloudwatch_task.filter_log_events
            region = task.region.value
            log_group = task.log_group_name.value
            query_pattern = task.filter_query.value
            if global_variable_set:
                for key, value in global_variable_set.items():
                    query_pattern = query_pattern.replace(key, str(value))

            logs_boto3_processor = self.get_connector_processor(cloudwatch_connector, region=region,
                                                                client_type='logs')

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
                raw_query=StringValue(value=f"Execute ```{query_pattern}``` on log group {log_group} in region {region}"),
                rows=table_rows,
                total_count=UInt64Value(value=len(table_rows)),
            )

            task_result = PlaybookTaskResult(type=PlaybookTaskResultType.LOGS, logs=result, source=self.source)
            return task_result
        except Exception as e:
            raise Exception(f"Error while executing Cloudwatch task: {e}")
