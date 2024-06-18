from datetime import datetime
from typing import Dict

from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.mimir_api_processor import MimirApiProcessor
from protos.base_pb2 import TimeRange
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, LabelValuePair, \
    PlaybookTaskResultType
from protos.playbooks.source_task_definitions.promql_task_pb2 import PromQl


class MimirSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.GRAFANA_MIMIR
        self.task_proto = PromQl
        self.task_type_callable_map = {
            PromQl.TaskType.PROMQL_METRIC_EXECUTION: {
                'task_type': 'PROMQL_METRIC_EXECUTION',
                'executor': self.execute_promql_metric_execution,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Query any of your Prometheus Data Sources from Mimir',
                'category': 'Metrics'
            },
        }

    def get_connector_processor(self, grafana_connector, **kwargs):
        generated_credentials = generate_credentials_dict(grafana_connector.type, grafana_connector.keys)
        return MimirApiProcessor(**generated_credentials)

    def execute_promql_metric_execution(self, time_range: TimeRange, global_variable_set: Dict, mimir_task: PromQl,
                                        mimir_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not mimir_connector:
                raise Exception("Task execution Failed:: No Mimir source found")

            tr_end_time = time_range.time_lt
            tr_start_time = time_range.time_geq
            current_datetime = datetime.utcfromtimestamp(tr_end_time)
            evaluation_time = datetime.utcfromtimestamp(tr_start_time)

            end_time = current_datetime.isoformat() + "Z"
            start_time = evaluation_time.isoformat() + "Z"
            period = '300s'

            task_result = PlaybookTaskResult()

            task = mimir_task.promql_metric_execution
            process_function = task.process_function.value
            promql_metric_query = task.promql_expression.value
            # promql_label_option_values = task.promql_label_option_values
            # for label_option in promql_label_option_values:
            #     promql_metric_query = promql_metric_query.replace(label_option.name.value,
            #                                                       label_option.value.value)
            for key, value in global_variable_set.items():
                promql_metric_query = promql_metric_query.replace(key, str(value))

            mimir_api_processor = self.get_connector_processor(mimir_connector)

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Promql_Metric_Query -> {}, Start_Time "
                "-> {}, End_Time -> {}, Period -> {}".format("Mimir", mimir_connector.account_id.value,
                                                             promql_metric_query,
                                                             start_time, end_time, period), flush=True)

            response = mimir_api_processor.fetch_promql_metric_timeseries(promql_metric_query,
                                                                          start_time, end_time, period)
            if not response:
                raise Exception("No data returned from Mimir")

            if process_function == 'timeseries':
                if 'data' in response and 'result' in response['data']:
                    labeled_metric_timeseries_list = []
                    for item in response['data']['result']:
                        metric_datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                        for value in item['values']:
                            utc_timestamp = value[0]
                            utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                            val = value[1]
                            datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                                timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=float(val)))
                            metric_datapoints.append(datapoint)
                        item_metrics = item['metric']
                        metric_label_values = []
                        for key, value in item_metrics.items():
                            metric_label_values.append(
                                LabelValuePair(name=StringValue(value=key), value=StringValue(value=value)))
                        labeled_metric_timeseries = TimeseriesResult.LabeledMetricTimeseries(
                            metric_label_values=metric_label_values, unit=StringValue(value=""),
                            datapoints=metric_datapoints)
                        labeled_metric_timeseries_list.append(labeled_metric_timeseries)

                    timeseries_result = TimeseriesResult(
                        metric_expression=StringValue(value=promql_metric_query),
                        labeled_metric_timeseries=labeled_metric_timeseries_list)

                    task_result = PlaybookTaskResult(
                        source=self.source,
                        type=PlaybookTaskResultType.TIMESERIES,
                        timeseries=timeseries_result
                    )
            return task_result
        except Exception as e:
            raise Exception(f"Error while executing Mimir task: {e}")
