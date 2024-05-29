from datetime import datetime
from typing import Dict

import pytz
from google.protobuf.wrappers_pb2 import StringValue, DoubleValue, UInt64Value

from connectors.models import Connector, ConnectorKey
from executor.playbook_task_executor import PlaybookTaskExecutor
from integrations_api_processors.aws_boto_3_api_processor import AWSBoto3ApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceKeyType
from protos.playbooks.playbook_commons_pb2 import TimeseriesResult, LabelValuePair, PlaybookTaskResult, \
    PlaybookTaskResultType, TableResult
from protos.playbooks.playbook_pb2 import PlaybookTask
from protos.playbooks.source_task_definitions.cloudwatch_task_pb2 import Cloudwatch


class CloudwatchTaskExecutor(PlaybookTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.CLOUDWATCH
        self.task_type_callable_map = {
            Cloudwatch.TaskType.METRIC_EXECUTION: self.execute_metric_execution,
            Cloudwatch.TaskType.FILTER_LOG_EVENTS: self.execute_filter_log_events
        }

        self.__account_id = account_id

        try:
            cloudwatch_connector = Connector.objects.get(account_id=account_id,
                                                         connector_type=Source.CLOUDWATCH,
                                                         is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Cloudwatch connector not found")
        if not cloudwatch_connector:
            raise Exception("Cloudwatch connector not found")

        cloudwatch_connector_key = ConnectorKey.objects.filter(connector_id=cloudwatch_connector.id,
                                                               account_id=account_id,
                                                               is_active=True)
        if not cloudwatch_connector_key:
            raise Exception("Cloudwatch connector key not found")

        self.__aws_session_token = None
        for key in cloudwatch_connector_key:
            if key.key_type == SourceKeyType.AWS_ACCESS_KEY:
                self.__aws_access_key = key.key
            elif key.key_type == SourceKeyType.AWS_SECRET_KEY:
                self.__aws_secret_key = key.key

        if not self.__aws_access_key or not self.__aws_secret_key:
            raise Exception("AWS credentials not found")

    def execute(self, time_range: TimeRange, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        try:
            cloudwatch_task: Cloudwatch = task.cloudwatch
            task_type = cloudwatch_task.type
            if task_type in self.task_type_callable_map:
                try:
                    return self.task_type_callable_map[task_type](time_range, global_variable_set, cloudwatch_task)
                except Exception as e:
                    raise Exception(f"Error while executing Cloudwatch task: {e}")
            else:
                raise Exception(f"Task type {task_type} not supported")
        except Exception as e:
            raise Exception(f"Error while executing Cloudwatch task: {e}")

    def execute_metric_execution(self, time_range: TimeRange, global_variable_set: Dict,
                                 cloudwatch_task: Cloudwatch) -> PlaybookTaskResult:
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

        cloudwatch_boto3_processor = AWSBoto3ApiProcessor('cloudwatch', region, self.__aws_access_key,
                                                          self.__aws_secret_key, self.__aws_session_token)

        print(
            "Playbook Task Downstream Request: Type -> {}, Account -> {}, Region -> {}, Namespace -> {}, Metric -> {}, Start_Time "
            "-> {}, End_Time -> {}, Period -> {}, Statistic -> {}, Dimensions -> {}".format(
                "Cloudwatch_Metrics", self.__account_id, region, namespace, metric_name, start_time, end_time, period,
                statistic, dimensions
            ), flush=True)

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

            timeseries_result = TimeseriesResult(metric_name=StringValue(value=metric_name),
                                                 metric_expression=StringValue(value=namespace),
                                                 labeled_metric_timeseries=labeled_metric_timeseries)

            task_result = PlaybookTaskResult(type=PlaybookTaskResultType.TIMESERIES, timeseries=timeseries_result,
                                             source=self.source)

        return task_result

    def execute_filter_log_events(self, time_range: TimeRange, global_variable_set: Dict,
                                  cloudwatch_task: Cloudwatch) -> PlaybookTaskResult:
        task_result = PlaybookTaskResult()
        tr_end_time = time_range.time_lt
        end_time = int(tr_end_time * 1000)
        tr_start_time = time_range.time_geq
        start_time = int(tr_start_time * 1000)

        task = cloudwatch_task.filter_log_events
        region = task.region.value
        log_group = task.log_group_name.value
        query_pattern = task.filter_query.value
        for key, value in global_variable_set.items():
            query_pattern = query_pattern.replace(key, str(value))

        logs_boto3_processor = AWSBoto3ApiProcessor('logs', region, self.__aws_access_key,
                                                    self.__aws_secret_key, self.__aws_session_token)

        print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Region -> {}, Log_Group -> {}, Query -> "
              "{}, Start_Time -> {}, End_Time -> {}".format(
            "Cloudwatch_Logs", self.__account_id, region, log_group, query_pattern, start_time, end_time
        ), flush=True)

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
            raw_query=StringValue(value=query_pattern),
            rows=table_rows,
            total_count=UInt64Value(value=len(table_rows)),
        )

        task_result = PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=result, source=self.source)
        return task_result
