# from datetime import datetime
# from typing import Dict
#
# from google.protobuf.wrappers_pb2 import DoubleValue, StringValue
#
# from connectors.models import Connector, ConnectorKey
# from executor.playbook_task_executor import PlaybookTaskExecutor
# from integrations_api_processors.vpc_api_processor import VpcApiProcessor
# from protos.base_pb2 import TimeRange, Source, SourceKeyType
# from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto, \
#     PlaybookGrafanaTask as PlaybookGrafanaTaskProto, PlaybookMetricTaskExecutionResult, \
#     TimeseriesResult as TimeseriesResultProto, LabelValuePair as LabelValuePairProto
#
#
# class GrafanaVpcMetricTaskExecutor(PlaybookTaskExecutor):
#
#     def __init__(self, account_id):
#         self.source = Source.GRAFANA_VPC
#         self.task_type_callable_map = {
#             PlaybookGrafanaTaskProto.TaskType.PROMQL_METRIC_EXECUTION: self.execute_promql_metric_execution_task
#         }
#
#         self.__account_id = account_id
#
#         try:
#             agent_proxy_connector = Connector.objects.get(account_id=account_id,
#                                                           connector_type=Source.AGENT_PROXY,
#                                                           is_active=True)
#         except Connector.DoesNotExist:
#             raise Exception("Active Grafana Agent Proxy not found for account: {}".format(account_id))
#         if not agent_proxy_connector:
#             raise Exception("Active Grafana Agent Proxy not found for account: {}".format(account_id))
#
#         grafana_connector_keys = ConnectorKey.objects.filter(connector_id=agent_proxy_connector.id,
#                                                              account_id=account_id,
#                                                              is_active=True)
#         if not grafana_connector_keys:
#             raise Exception("Active Grafana Agent Proxy keys not found for account: {}".format(account_id))
#
#         for key in grafana_connector_keys:
#             if key.key_type == SourceKeyType.AGENT_PROXY_API_KEY:
#                 self.__api_key = key.key
#             elif key.key_type == SourceKeyType.AGENT_PROXY_HOST:
#                 self.__host = key.key
#
#         if not self.__api_key or not self.__host:
#             raise Exception("Grafana Agent Proxy API key or host not found for account: {}".format(account_id))
#
#     def execute(self, time_range: TimeRange, global_variable_set: Dict,
#                 task: PlaybookMetricTaskDefinitionProto) -> PlaybookMetricTaskExecutionResult:
#         grafana_task = task.grafana_task
#         task_type = grafana_task.type
#         if task_type in self.task_type_callable_map:
#             try:
#                 return self.task_type_callable_map[task_type](time_range, global_variable_set, grafana_task)
#             except Exception as e:
#                 raise Exception(f"Error while executing Grafana task: {e}")
#         else:
#             raise Exception(f"Task type {task_type} not supported")
#
#     def execute_promql_metric_execution_task(self, time_range: TimeRange, global_variable_set: Dict,
#                                              grafana_task: PlaybookGrafanaTaskProto) -> PlaybookMetricTaskExecutionResult:
#         tr_end_time = time_range.time_lt
#         tr_start_time = time_range.time_geq
#         current_datetime = datetime.utcfromtimestamp(tr_end_time)
#         evaluation_time = datetime.utcfromtimestamp(tr_start_time)
#
#         end_time = current_datetime.isoformat() + "Z"
#         start_time = evaluation_time.isoformat() + "Z"
#         period = 300
#
#         task_execution_result = PlaybookMetricTaskExecutionResult()
#         datasource_uid = grafana_task.datasource_uid.value
#
#         task = grafana_task.promql_metric_execution_task
#         process_function = task.process_function.value
#         promql_metric_query = task.promql_expression.value
#         promql_label_option_values = task.promql_label_option_values
#         for label_option in promql_label_option_values:
#             promql_metric_query = promql_metric_query.replace(label_option.name.value,
#                                                               label_option.value.value)
#         for key, value in global_variable_set.items():
#             promql_metric_query = promql_metric_query.replace(key, str(value))
#
#         grafana_api_processor = VpcApiProcessor(self.__host, self.__api_key)
#
#         print(
#             "Playbook Task Downstream Request: Type -> {}, Account -> {}, Datasource_Uid -> {}, Promql_Metric_Query -> {}, Start_Time "
#             "-> {}, End_Time -> {}, Period -> {}".format(
#                 "Grafana", self.__account_id, datasource_uid, promql_metric_query, start_time, end_time, period
#             ), flush=True)
#
#         path = 'api/datasources/proxy/uid/{}/api/v1/query_range?query={}&start={}&end={}&step={}'.format(
#             datasource_uid, promql_metric_query, start_time, end_time, period)
#         response = grafana_api_processor.v1_api_grafana(path=path)
#         if not response:
#             raise Exception("No data returned from Grafana")
#
#         if process_function == 'timeseries':
#             if 'data' in response and 'result' in response['data']:
#                 labeled_metric_timeseries_list = []
#                 for item in response['data']['result']:
#                     metric_datapoints: [TimeseriesResultProto.LabeledMetricTimeseries.Datapoint] = []
#                     for value in item['values']:
#                         utc_timestamp = value[0]
#                         utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
#                         val = value[1]
#                         datapoint = TimeseriesResultProto.LabeledMetricTimeseries.Datapoint(
#                             timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=float(val)))
#                         metric_datapoints.append(datapoint)
#                     item_metrics = item['metric']
#                     metric_label_values = []
#                     for key, value in item_metrics.items():
#                         metric_label_values.append(
#                             LabelValuePairProto(name=StringValue(value=key), value=StringValue(value=value)))
#                     labeled_metric_timeseries = TimeseriesResultProto.LabeledMetricTimeseries(
#                         metric_label_values=metric_label_values, unit=StringValue(value=""),
#                         datapoints=metric_datapoints)
#                     labeled_metric_timeseries_list.append(labeled_metric_timeseries)
#
#                 result = PlaybookMetricTaskExecutionResult.Result(
#                     type=PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
#                     timeseries=TimeseriesResultProto(labeled_metric_timeseries=labeled_metric_timeseries_list))
#
#                 task_execution_result = PlaybookMetricTaskExecutionResult(
#                     metric_source=Source.GRAFANA,
#                     metric_expression=StringValue(value=promql_metric_query),
#                     result=result)
#
#         return task_execution_result
