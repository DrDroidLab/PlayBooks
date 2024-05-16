# import re
# from datetime import datetime
# from typing import Dict
#
# import pytz
# from google.protobuf.wrappers_pb2 import DoubleValue, StringValue
#
# from connectors.models import Connector, ConnectorKey
# from executor.playbook_task_executor import PlaybookTaskExecutor
# from integrations_api_processors.new_relic_graph_ql_processor import NewRelicGraphQlConnector
# from protos.base_pb2 import TimeRange, Source, SourceKeyType
# from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto, \
#     PlaybookNewRelicTask as PlaybookNewRelicTaskProto, PlaybookMetricTaskExecutionResult, \
#     TimeseriesResult as TimeseriesResultProto, LabelValuePair as LabelValuePairProto
#
#
# def get_nrql_expression_result_alias(nrql_expression):
#     pattern = r'AS\s+\'(.*?)\'|AS\s+(\w+)'
#     match = re.search(pattern, nrql_expression, re.IGNORECASE)
#     if match:
#         return match.group(1) or match.group(2)
#     return 'result'
#
#
# class NewRelicMetricTaskExecutor(PlaybookTaskExecutor):
#
#     def __init__(self, account_id):
#         self.source = Source.NEW_RELIC
#         self.task_type_callable_map = {
#             PlaybookNewRelicTaskProto.TaskType.ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION: self.execute_entity_application_golden_metric_execution_task,
#             PlaybookNewRelicTaskProto.TaskType.ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION: self.execute_entity_dashboard_widget_nrql_metric_execution_task,
#             PlaybookNewRelicTaskProto.TaskType.NRQL_METRIC_EXECUTION: self.execute_nrql_metric_execution_task
#         }
#
#         self.__account_id = account_id
#
#         try:
#             nr_connector = Connector.objects.get(account_id=account_id,
#                                                  connector_type=Source.NEW_RELIC,
#                                                  is_active=True)
#         except Connector.DoesNotExist:
#             raise Exception("New Relic connector not found for account: " + account_id)
#         if not nr_connector:
#             raise Exception("New Relic connector not found for account: " + account_id)
#
#         nr_connector_keys = ConnectorKey.objects.filter(connector_id=nr_connector.id,
#                                                         account_id=account_id,
#                                                         is_active=True)
#         if not nr_connector_keys:
#             raise Exception("New Relic connector key not found for account: " + account_id)
#
#         for key in nr_connector_keys:
#             if key.key_type == SourceKeyType.NEWRELIC_API_KEY:
#                 self.__nr_api_key = key.key
#             elif key.key_type == SourceKeyType.NEWRELIC_APP_ID:
#                 self.__nr_app_id = key.key
#             elif key.key_type == SourceKeyType.NEWRELIC_API_DOMAIN:
#                 self.__nr_api_domain = key.key
#
#         if not self.__nr_api_key or not self.__nr_app_id:
#             raise Exception("New Relic credentials not found for account: " + account_id)
#         if not self.__nr_api_domain:
#             self.__nr_api_domain = 'api.newrelic.com'
#
#     def execute(self, time_range: TimeRange, global_variable_set: Dict,
#                 task: PlaybookMetricTaskDefinitionProto) -> PlaybookMetricTaskExecutionResult:
#         nr_task = task.new_relic_task
#         task_type = nr_task.type
#         if task_type in self.task_type_callable_map:
#             try:
#                 return self.task_type_callable_map[task_type](time_range, global_variable_set, nr_task)
#             except Exception as e:
#                 raise Exception(f"Error while executing New Relic task: {e}")
#         else:
#             raise Exception(f"Task type {task_type} not supported")
#
#     def execute_entity_application_golden_metric_execution_task(self, time_range: TimeRange, global_variable_set: Dict,
#                                                                 nr_task: PlaybookNewRelicTaskProto) -> PlaybookMetricTaskExecutionResult:
#         task_execution_result = PlaybookMetricTaskExecutionResult()
#
#         task = nr_task.entity_application_golden_metric_execution_task
#         name = task.golden_metric_name.value
#         unit = task.golden_metric_unit.value
#
#         nrql_expression = task.golden_metric_nrql_expression.value
#         if 'timeseries' not in nrql_expression.lower():
#             raise Exception("Invalid NRQL expression. TIMESERIES is missing in the NRQL expression")
#         if 'limit max timeseries' in nrql_expression.lower():
#             if 'LIMIT MAX TIMESERIES' in nrql_expression:
#                 nrql_expression = nrql_expression.replace('LIMIT MAX TIMESERIES', 'TIMESERIES 5 MINUTE')
#             else:
#                 nrql_expression = nrql_expression.replace('limit max timeseries', 'TIMESERIES 5 MINUTE')
#         if 'since' not in nrql_expression.lower():
#             time_since = time_range.time_geq
#             time_until = time_range.time_lt
#             total_seconds = (time_until - time_since)
#             nrql_expression = nrql_expression + f' SINCE {total_seconds} SECONDS AGO'
#
#         result_alias = get_nrql_expression_result_alias(nrql_expression)
#
#         nr_gql_processor = NewRelicGraphQlConnector(self.__nr_api_key, self.__nr_app_id, self.__nr_api_domain)
#
#         print(
#             "Playbook Task Downstream Request: Type -> {}, Account -> {}, Nrql_Expression -> {}".format(
#                 "NewRelic", self.__account_id, nrql_expression
#             ), flush=True)
#
#         response = nr_gql_processor.execute_nrql_query(nrql_expression)
#         if not response or 'results' not in response:
#             raise Exception("No data returned from New Relic")
#
#         results = []
#         if response and 'results' in response:
#             results = response['results']
#         process_function = task.process_function.value
#         if process_function == 'timeseries':
#             metric_datapoints: [TimeseriesResultProto.LabeledMetricTimeseries.Datapoint] = []
#             for item in results:
#                 utc_timestamp = item['beginTimeSeconds']
#                 utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
#                 utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
#                 val = item.get(result_alias)
#                 datapoint = TimeseriesResultProto.LabeledMetricTimeseries.Datapoint(
#                     timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
#                 metric_datapoints.append(datapoint)
#
#             labeled_metric_timeseries = TimeseriesResultProto.LabeledMetricTimeseries(unit=StringValue(value=unit),
#                                                                                       datapoints=metric_datapoints)
#
#             result = PlaybookMetricTaskExecutionResult.Result(
#                 type=PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
#                 timeseries=TimeseriesResultProto(labeled_metric_timeseries=[labeled_metric_timeseries]))
#
#             task_execution_result = PlaybookMetricTaskExecutionResult(
#                 metric_source=Source.NEW_RELIC,
#                 metric_expression=StringValue(value=nrql_expression),
#                 metric_name=StringValue(value=name),
#                 result=result)
#
#         return task_execution_result
#
#     def execute_entity_dashboard_widget_nrql_metric_execution_task(self, time_range: TimeRange,
#                                                                    global_variable_set: Dict,
#                                                                    nr_task: PlaybookNewRelicTaskProto) -> PlaybookMetricTaskExecutionResult:
#         task_execution_result = PlaybookMetricTaskExecutionResult()
#
#         task = nr_task.entity_dashboard_widget_nrql_metric_execution_task
#         metric_name = task.widget_title.value
#         if task.unit and task.unit.value:
#             unit = task.unit.value
#         else:
#             unit = ''
#
#         nrql_expression = task.widget_nrql_expression.value
#         if 'timeseries' not in nrql_expression.lower():
#             raise Exception("Invalid NRQL expression. TIMESERIES is missing in the NRQL expression")
#         if 'limit max timeseries' in nrql_expression.lower():
#             if 'LIMIT MAX TIMESERIES' in nrql_expression:
#                 nrql_expression = nrql_expression.replace('LIMIT MAX TIMESERIES', 'TIMESERIES 5 MINUTE')
#             else:
#                 nrql_expression = nrql_expression.replace('limit max timeseries', 'TIMESERIES 5 MINUTE')
#         if 'since' not in nrql_expression.lower():
#             time_since = time_range.time_geq
#             time_until = time_range.time_lt
#             total_seconds = (time_until - time_since)
#             nrql_expression = nrql_expression + f' SINCE {total_seconds} SECONDS AGO'
#
#         nr_gql_processor = NewRelicGraphQlConnector(self.__nr_api_key, self.__nr_app_id, self.__nr_api_domain)
#         response = nr_gql_processor.execute_nrql_query(nrql_expression)
#         if not response:
#             raise Exception("No data returned from New Relic")
#
#         results = None
#         facet_keys = []
#         if response and 'metadata' in response and 'facets' in response['metadata']:
#             facet_keys = response['metadata']['facets']
#         if response and 'rawResponse' in response:
#             results = response['rawResponse']
#         process_function = task.process_function.value
#         if process_function == 'timeseries' and 'TIMESERIES' in nrql_expression:
#             labeled_metric_timeseries_list = []
#             metric_datapoints: [TimeseriesResultProto.LabeledMetricTimeseries.Datapoint] = []
#             if facet_keys:
#                 results = results['facets']
#             else:
#                 results = [results]
#             for item in results:
#                 metric_label_values = []
#                 if 'name' in item:
#                     facets = []
#                     name = item['name']
#                     if isinstance(name, str):
#                         facets = [name]
#                     elif isinstance(name, list):
#                         facets = name
#                     if len(facets) > 0 and len(facets) == len(facet_keys):
#                         for idx, f in enumerate(facets):
#                             metric_label_values.append(LabelValuePairProto(name=StringValue(value=facet_keys[idx]),
#                                                                            value=StringValue(value=f)))
#                 time_series = item['timeSeries']
#                 for ts in time_series:
#                     utc_timestamp = ts['beginTimeSeconds']
#                     utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
#                     utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
#                     ts_results = ts['results']
#                     val = None
#                     for k, v in ts_results[0].items():
#                         val = v
#
#                     if val:
#                         dp = val
#                     else:
#                         dp = 0
#                     datapoint = TimeseriesResultProto.LabeledMetricTimeseries.Datapoint(
#                         timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=dp))
#                     metric_datapoints.append(datapoint)
#
#                 labeled_metric_timeseries_list.append(
#                     TimeseriesResultProto.LabeledMetricTimeseries(metric_label_values=metric_label_values,
#                                                                   unit=StringValue(value=unit),
#                                                                   datapoints=metric_datapoints))
#
#             result = PlaybookMetricTaskExecutionResult.Result(
#                 type=PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
#                 timeseries=TimeseriesResultProto(labeled_metric_timeseries=labeled_metric_timeseries_list))
#
#             task_execution_result = PlaybookMetricTaskExecutionResult(
#                 metric_source=Source.NEW_RELIC,
#                 metric_expression=StringValue(value=nrql_expression),
#                 metric_name=StringValue(value=metric_name),
#                 result=result)
#
#         return task_execution_result
#
#     def execute_nrql_metric_execution_task(self, time_range: TimeRange, global_variable_set: Dict,
#                                            nr_task: PlaybookNewRelicTaskProto) -> PlaybookMetricTaskExecutionResult:
#         task_execution_result = PlaybookMetricTaskExecutionResult()
#
#         task = nr_task.nrql_metric_execution_task
#         metric_name = task.metric_name.value
#         if task.unit and task.unit.value:
#             unit = task.unit.value
#         else:
#             unit = ''
#
#         nrql_expression = task.nrql_expression.value
#         if 'timeseries' not in nrql_expression.lower():
#             raise Exception("Invalid NRQL expression. TIMESERIES is missing in the NRQL expression")
#         for key, value in global_variable_set.items():
#             nrql_expression = nrql_expression.replace(key, str(value))
#         if 'limit max timeseries' in nrql_expression.lower():
#             if 'LIMIT MAX TIMESERIES' in nrql_expression:
#                 nrql_expression = nrql_expression.replace('LIMIT MAX TIMESERIES', 'TIMESERIES 5 MINUTE')
#             else:
#                 nrql_expression = nrql_expression.replace('limit max timeseries', 'TIMESERIES 5 MINUTE')
#         if 'since' not in nrql_expression.lower():
#             time_since = time_range.time_geq
#             time_until = time_range.time_lt
#             total_seconds = (time_until - time_since)
#             nrql_expression = nrql_expression + f' SINCE {total_seconds} SECONDS AGO'
#
#         nr_gql_processor = NewRelicGraphQlConnector(self.__nr_api_key, self.__nr_app_id, self.__nr_api_domain)
#         response = nr_gql_processor.execute_nrql_query(nrql_expression)
#         if not response:
#             raise Exception("No data returned from New Relic")
#
#         results = None
#         facet_keys = []
#         if response and 'metadata' in response and 'facets' in response['metadata']:
#             facet_keys = response['metadata']['facets']
#         if response and 'rawResponse' in response:
#             results = response['rawResponse']
#         process_function = task.process_function.value
#         if process_function == 'timeseries' and 'TIMESERIES' in nrql_expression:
#             labeled_metric_timeseries_list = []
#             metric_datapoints: [TimeseriesResultProto.LabeledMetricTimeseries.Datapoint] = []
#             if facet_keys:
#                 results = results['facets']
#             else:
#                 results = [results]
#             for item in results:
#                 metric_label_values = []
#                 if 'name' in item:
#                     facets = []
#                     name = item['name']
#                     if isinstance(name, str):
#                         facets = [name]
#                     elif isinstance(name, list):
#                         facets = name
#                     if len(facets) > 0 and len(facets) == len(facet_keys):
#                         for idx, f in enumerate(facets):
#                             metric_label_values.append(LabelValuePairProto(name=StringValue(value=facet_keys[idx]),
#                                                                            value=StringValue(value=f)))
#                 time_series = item['timeSeries']
#                 for ts in time_series:
#                     utc_timestamp = ts['beginTimeSeconds']
#                     utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
#                     utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
#                     ts_results = ts['results']
#                     val = None
#                     for k, v in ts_results[0].items():
#                         val = v
#
#                     if val:
#                         dp = val
#                     else:
#                         dp = 0
#                     datapoint = TimeseriesResultProto.LabeledMetricTimeseries.Datapoint(
#                         timestamp=int(utc_datetime.timestamp() * 1000),
#                         value=DoubleValue(value=dp)
#                     )
#                     metric_datapoints.append(datapoint)
#
#                 labeled_metric_timeseries_list.append(
#                     TimeseriesResultProto.LabeledMetricTimeseries(metric_label_values=metric_label_values,
#                                                                   unit=StringValue(value=unit),
#                                                                   datapoints=metric_datapoints))
#
#             result = PlaybookMetricTaskExecutionResult.Result(
#                 type=PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
#                 timeseries=TimeseriesResultProto(labeled_metric_timeseries=labeled_metric_timeseries_list))
#
#             task_execution_result = PlaybookMetricTaskExecutionResult(
#                 metric_source=Source.NEW_RELIC,
#                 metric_expression=StringValue(value=nrql_expression),
#                 metric_name=StringValue(value=metric_name),
#                 result=result)
#
#         return task_execution_result
