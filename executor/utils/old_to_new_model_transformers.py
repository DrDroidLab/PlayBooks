from google.protobuf.wrappers_pb2 import StringValue

from protos.base_pb2 import Source
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, PlaybookTaskResultType, \
    TableResult
from protos.playbooks.deprecated_playbook_pb2 import DeprecatedPlaybookTaskExecutionResult, \
    DeprecatedPlaybookMetricTaskExecutionResult, DeprecatedPlaybookDataFetchTaskExecutionResult, \
    DeprecatedPlaybookActionTaskExecutionResult


def transform_PlaybookTaskExecutionResult_to_PlaybookTaskResult(old_result: DeprecatedPlaybookTaskExecutionResult):
    if old_result.error and old_result.error.value:
        return PlaybookTaskResult(error=old_result.error)
    which_oneof = old_result.WhichOneof('result')
    if which_oneof == 'metric_task_execution_result':
        metric_task_result: DeprecatedPlaybookMetricTaskExecutionResult = old_result.metric_task_execution_result
        metric_task_result_type = metric_task_result.result.type
        if metric_task_result_type == DeprecatedPlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES:
            timeseries_result = TimeseriesResult(
                metric_name=metric_task_result.metric_name,
                metric_expression=metric_task_result.metric_expression,
                labeled_metric_timeseries=metric_task_result.result.timeseries.labeled_metric_timeseries
            )
            return PlaybookTaskResult(source=metric_task_result.metric_source, timeseries=timeseries_result,
                                      type=PlaybookTaskResultType.TIMESERIES)
        elif metric_task_result_type == DeprecatedPlaybookMetricTaskExecutionResult.Result.Type.TABLE_RESULT:
            table_result = TableResult(
                rows=metric_task_result.result.table_result.rows,
                raw_query=metric_task_result.metric_expression,
                limit=metric_task_result.result.table_result.limit,
                offset=metric_task_result.result.table_result.offset,
                total_count=metric_task_result.result.table_result.total_count
            )
            return PlaybookTaskResult(source=metric_task_result.metric_source, table=table_result,
                                      type=PlaybookTaskResultType.TABLE)
    elif which_oneof == 'data_fetch_task_execution_result':
        data_fetch_task_result: DeprecatedPlaybookDataFetchTaskExecutionResult = old_result.data_fetch_task_execution_result
        table_result = TableResult(
            rows=data_fetch_task_result.result.table_result.rows,
            raw_query=data_fetch_task_result.result.table_result.raw_query,
            limit=data_fetch_task_result.result.table_result.limit,
            offset=data_fetch_task_result.result.table_result.offset,
            total_count=data_fetch_task_result.result.table_result.total_count
        )
        return PlaybookTaskResult(source=data_fetch_task_result.data_source, table=table_result,
                                  type=PlaybookTaskResultType.TABLE)
    elif which_oneof == 'documentation_task_execution_result':
        return PlaybookTaskResult()
    elif which_oneof == 'action_task_execution_result':
        action_task_result: DeprecatedPlaybookActionTaskExecutionResult = old_result.action_task_execution_result
        if action_task_result.result.type == DeprecatedPlaybookActionTaskExecutionResult.Result.Type.BASH_COMMAND_OUTPUT:
            bash_command_output = action_task_result.result.bash_command_output
            return PlaybookTaskResult(source=Source.BASH, type=PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                                      bash_command_output=bash_command_output)
        elif action_task_result.result.type == DeprecatedPlaybookActionTaskExecutionResult.Result.Type.API_RESPONSE:
            api_response = action_task_result.result.api_response
            return PlaybookTaskResult(source=Source.API, type=PlaybookTaskResultType.API_RESPONSE,
                                      api_response=api_response)
        else:
            raise ValueError(f'Unsupported action task result type: {action_task_result.result.type}')
    else:
        raise ValueError(f'No transformer found for result type: {which_oneof}')


def transform_PlaybookTaskExecutionResult_json_to_PlaybookTaskResult_json(old_result: dict):
    if old_result.get('error'):
        return {
            'error': old_result['error']
        }

    if old_result.get('metric_task_execution_result', None):
        metric_task_result = old_result['metric_task_execution_result']
        metric_task_result_type = metric_task_result['result']['type']

        if metric_task_result_type == 'TIMESERIES':
            timeseries_result = {
                'metric_name': metric_task_result.get('metric_name', None),
                'metric_expression': metric_task_result.get('metric_expression', None),
                'labeled_metric_timeseries': metric_task_result['result']['timeseries']['labeled_metric_timeseries']
            }
            return {
                'source': metric_task_result.get('metric_source', None),
                'timeseries': timeseries_result,
                'type': 'TIMESERIES'
            }

        elif metric_task_result_type == 'TABLE_RESULT':
            table_result = {
                'rows': metric_task_result['result']['table_result'].get('rows', None),
                'raw_query': metric_task_result.get('metric_expression', None),
                'limit': metric_task_result['result']['table_result'].get('limit', None),
                'offset': metric_task_result['result']['table_result'].get('offset', None),
                'total_count': metric_task_result['result']['table_result'].get('total_count', None)
            }
            return {
                'source': metric_task_result['metric_source'],
                'table': table_result,
                'type': 'TABLE'
            }

    elif old_result.get('data_fetch_task_execution_result', None):
        data_fetch_task_result = old_result['data_fetch_task_execution_result']
        table_result = {
            'rows': data_fetch_task_result['result']['table_result'].get('rows', None),
            'raw_query': data_fetch_task_result['result']['table_result']['raw_query'],
            'limit': data_fetch_task_result['result']['table_result'].get('limit', None),
            'offset': data_fetch_task_result['result']['table_result'].get('offset', None),
            'total_count': data_fetch_task_result['result']['table_result'].get('total_count', None)
        }
        return {
            'source': data_fetch_task_result['data_source'],
            'table': table_result,
            'type': 'TABLE'
        }

    elif old_result.get('documentation_task_execution_result', None):
        return {}

    elif old_result.get('action_task_execution_result', None):
        action_task_result = old_result['action_task_execution_result']
        action_result_type = action_task_result['result']['type']

        if action_result_type == 'BASH_COMMAND_OUTPUT':
            bash_command_output = action_task_result['result']['bash_command_output']
            return {
                'source': 'BASH',
                'type': 'BASH_COMMAND_OUTPUT',
                'bash_command_output': bash_command_output
            }

        elif action_result_type == 'API_RESPONSE':
            api_response = action_task_result['result']['api_response']
            return {
                'source': 'API',
                'type': 'API_RESPONSE',
                'api_response': api_response
            }

        else:
            raise ValueError(f'Unsupported action task result type: {action_result_type}')

    else:
        raise ValueError(f'No transformer found for result: {old_result}')


def transform_PlaybookTaskResult_to_PlaybookTaskExecutionResult(
        new_result: PlaybookTaskResult) -> DeprecatedPlaybookTaskExecutionResult:
    if new_result.error and new_result.error.value:
        return DeprecatedPlaybookTaskExecutionResult(error=new_result.error)
    elif new_result.type == PlaybookTaskResultType.TIMESERIES:
        return DeprecatedPlaybookTaskExecutionResult(
            metric_task_execution_result=DeprecatedPlaybookMetricTaskExecutionResult(
                metric_name=new_result.timeseries.metric_name,
                metric_expression=new_result.timeseries.metric_expression,
                metric_source=new_result.source,
                result=DeprecatedPlaybookMetricTaskExecutionResult.Result(
                    type=DeprecatedPlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
                    timeseries=TimeseriesResult(
                        labeled_metric_timeseries=new_result.timeseries.labeled_metric_timeseries
                    )
                )
            )
        )
    elif new_result.type == PlaybookTaskResultType.TABLE and new_result.source in [Source.CLOUDWATCH]:
        return DeprecatedPlaybookTaskExecutionResult(
            metric_task_execution_result=DeprecatedPlaybookMetricTaskExecutionResult(
                metric_name=StringValue(value='log_events'),
                metric_expression=new_result.table.raw_query,
                metric_source=new_result.source,
                result=DeprecatedPlaybookMetricTaskExecutionResult.Result(
                    type=DeprecatedPlaybookMetricTaskExecutionResult.Result.Type.TABLE_RESULT,
                    table_result=TableResult(
                        rows=new_result.table.rows
                    )
                )
            )
        )
    elif new_result.type == PlaybookTaskResultType.TABLE:
        return DeprecatedPlaybookTaskExecutionResult(
            data_fetch_task_execution_result=DeprecatedPlaybookDataFetchTaskExecutionResult(
                data_source=new_result.source,
                result=DeprecatedPlaybookDataFetchTaskExecutionResult.Result(
                    type=DeprecatedPlaybookDataFetchTaskExecutionResult.Result.Type.TABLE_RESULT,
                    table_result=TableResult(
                        rows=new_result.table.rows,
                        raw_query=new_result.table.raw_query,
                        limit=new_result.table.limit,
                        offset=new_result.table.offset,
                        total_count=new_result.table.total_count
                    )
                )
            )
        )
    elif new_result.type == PlaybookTaskResultType.BASH_COMMAND_OUTPUT:
        return DeprecatedPlaybookTaskExecutionResult(
            action_task_execution_result=DeprecatedPlaybookActionTaskExecutionResult(
                result=DeprecatedPlaybookActionTaskExecutionResult.Result(
                    type=DeprecatedPlaybookActionTaskExecutionResult.Result.Type.BASH_COMMAND_OUTPUT,
                    bash_command_output=new_result.bash_command_output
                )
            )
        )
    elif new_result.type == PlaybookTaskResultType.API_RESPONSE:
        return DeprecatedPlaybookTaskExecutionResult(
            action_task_execution_result=DeprecatedPlaybookActionTaskExecutionResult(
                result=DeprecatedPlaybookActionTaskExecutionResult.Result(
                    type=DeprecatedPlaybookActionTaskExecutionResult.Result.Type.API_RESPONSE,
                    api_response=new_result.api_response
                )
            )
        )
    else:
        raise ValueError(f'Unsupported task result type: {new_result.type}')


def transform_old_task_definition_to_new(task):
    source = task.get('source', None)
    if source == 'CLOUDWATCH':
        cloudwatch_task = task.get('cloudwatch_task')
        if cloudwatch_task.get('type') == 'METRIC_EXECUTION':
            updated_task_def = {
                'source': 'CLOUDWATCH',
                'cloudwatch': {
                    'type': 'METRIC_EXECUTION',
                    'metric_execution': cloudwatch_task.get('metric_execution_task')
                }
            }
        elif cloudwatch_task.get('type') == 'FILTER_LOG_EVENTS':
            updated_task_def = {
                'source': 'CLOUDWATCH',
                'cloudwatch': {
                    'type': 'FILTER_LOG_EVENTS',
                    'filter_log_events': cloudwatch_task.get('filter_log_events_task')
                }
            }
        else:
            raise Exception(f"Task type {cloudwatch_task.get('type', None)} not supported")
    elif source == 'GRAFANA':
        grafana_task = task.get('grafana_task', {})
        if grafana_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
            datasource_uid = grafana_task.get('datasource_uid', None)
            promql_metric_execution = grafana_task.get('promql_metric_execution_task', None)
            promql_metric_execution['datasource_uid'] = datasource_uid
            updated_task_def = {
                'source': 'GRAFANA',
                'grafana': {
                    'type': 'PROMQL_METRIC_EXECUTION',
                    'promql_metric_execution': promql_metric_execution
                }
            }
        else:
            raise Exception(f"Task type {grafana_task.get('type', None)} not supported")
    elif source == 'NEW_RELIC':
        nr_task = task.get('new_relic_task')
        if nr_task.get('type', None) == 'ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'NEW_RELIC',
                'new_relic': {
                    'type': 'ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION',
                    'entity_application_golden_metric_execution': nr_task.get(
                        'entity_application_golden_metric_execution_task')
                }
            }
        elif nr_task.get('type', None) == 'ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'NEW_RELIC',
                'new_relic': {
                    'type': 'ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION',
                    'entity_dashboard_widget_nrql_metric_execution': nr_task.get(
                        'entity_dashboard_widget_nrql_metric_execution_task')
                }
            }
        elif nr_task.get('type', None) == 'NRQL_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'NEW_RELIC',
                'new_relic': {
                    'type': 'NRQL_METRIC_EXECUTION',
                    'nrql_metric_execution': nr_task.get('nrql_metric_execution_task')
                }
            }
        else:
            raise Exception(f"Task type {nr_task.get('type', None)} not supported")
    elif source == 'DATADOG':
        dd_task = task.get('datadog_task', {})
        if dd_task.get('type', None) == 'SERVICE_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'DATADOG',
                'datadog': {
                    'type': 'SERVICE_METRIC_EXECUTION',
                    'service_metric_execution': dd_task.get('service_metric_execution_task', {})
                }
            }
        elif dd_task.get('type', None) == 'QUERY_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'DATADOG',
                'datadog': {
                    'type': 'QUERY_METRIC_EXECUTION',
                    'query_metric_execution': dd_task.get('query_metric_execution_task', {})
                }
            }
        else:
            raise Exception(f"Task type {dd_task.get('type', None)} not supported")
    elif source == 'GRAFANA_MIMIR':
        mimir_task = task.get('mimir_task', {})
        if mimir_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'GRAFANA_MIMIR',
                'grafana_mimir': {
                    'type': 'PROMQL_METRIC_EXECUTION',
                    'promql_metric_execution': mimir_task.get('promql_metric_execution_task', {})
                }
            }
        else:
            raise Exception(f"Task type {mimir_task.get('type', None)} not supported")

    elif source == 'CLICKHOUSE':
        clickhouse_data_fetch_task = task.get('clickhouse_data_fetch_task', {})
        updated_task_def = {
            'source': 'CLICKHOUSE',
            'clickhouse': {
                'type': 'SQL_QUERY',
                'sql_query': {
                    'database': clickhouse_data_fetch_task.get('database', None),
                    'query': clickhouse_data_fetch_task.get('query', None),
                }
            }
        }
    elif source == 'POSTGRES':
        postgres_data_fetch_task = task.get('postgres_data_fetch_task', {})
        updated_task_def = {
            'source': 'POSTGRES',
            'postgres': {
                'type': 'SQL_QUERY',
                'sql_query': {
                    'database': postgres_data_fetch_task.get('database', None),
                    'query': postgres_data_fetch_task.get('query', None),
                }
            }
        }
    elif source == 'SQL_DATABASE_CONNECTION':
        sql_database_connection_task = task.get('sql_database_connection_task', {})
        updated_task_def = {
            'source': 'SQL_DATABASE_CONNECTION',
            'sql_database_connection': {
                'type': 'SQL_QUERY',
                'sql_query': {
                    'query': sql_database_connection_task.get('query', None),
                }
            }
        }
    elif source == 'EKS':
        eks_data_fetch_task = task.get('eks_data_fetch_task', {})
        command_type = eks_data_fetch_task.get('command_type', None)
        command_specs = {
            'description': eks_data_fetch_task.get('description', None),
            'region': eks_data_fetch_task.get('region', None),
            'cluster': eks_data_fetch_task.get('cluster', None),
            'namespace': eks_data_fetch_task.get('namespace', None),
        }
        if command_type == 'GET_PODS':
            updated_task_def = {
                'source': 'EKS',
                'eks': {
                    'type': eks_data_fetch_task.get('command_type', None),
                    'get_pods': command_specs
                }
            }
        elif command_type == 'GET_SERVICES':
            updated_task_def = {
                'source': 'EKS',
                'eks': {
                    'type': eks_data_fetch_task.get('command_type', None),
                    'get_services': command_specs
                }
            }
        elif command_type == 'GET_DEPLOYMENTS':
            updated_task_def = {
                'source': 'EKS',
                'eks': {
                    'type': eks_data_fetch_task.get('command_type', None),
                    'get_deployments': command_specs
                }
            }
        elif command_type == 'GET_EVENTS':
            updated_task_def = {
                'source': 'EKS',
                'eks': {
                    'type': eks_data_fetch_task.get('command_type', None),
                    'get_events': command_specs
                }
            }
        else:
            raise ValueError(f"Invalid command type: {command_type}")
    elif source == 'API':
        api_call_task = task.get('api_call_task', {})
        updated_task_def = {
            'source': 'API',
            'api': {
                'type': 'HTTP_REQUEST',
                'http_request': {
                    'method': api_call_task.get('method', None),
                    'url': api_call_task.get('url', None),
                    'headers': api_call_task.get('headers', None),
                    'payload': api_call_task.get('payload', None),
                    'timeout': api_call_task.get('timeout', None),
                    'cookies': api_call_task.get('cookies', None),
                }
            }
        }
    elif source == 'BASH':
        bash_command_task = task.get('bash_command_task', {})
        updated_task_def = {
            'source': 'BASH',
            'bash': {
                'type': 'COMMAND',
                'command': {
                    'command': bash_command_task.get('command', None),
                    'remote_server': bash_command_task.get('remote_server', None),
                }
            }
        }
    elif task.get('documentation_task', None):
        updated_task_def = {
            'source': 'DOCUMENTATION',
            'documentation': {
                'type': 'MARKDOWN',
                'markdown': {
                    'content': task.get('documentation_task', {}).get('documentation', None)
                }
            }
        }
    else:
        raise ValueError(f"Invalid source: {source}")
    return updated_task_def


def transform_new_task_definition_to_old(task):
    source = task.get('source', None)
    if source == 'CLOUDWATCH':
        cloudwatch_task = task.get('cloudwatch', {})
        if cloudwatch_task.get('type') == 'METRIC_EXECUTION':
            updated_task_def = {
                'source': 'CLOUDWATCH',
                'cloudwatch_task': {
                    'type': 'METRIC_EXECUTION',
                    'metric_execution_task': cloudwatch_task.get('metric_execution', {})
                }
            }
        elif cloudwatch_task.get('type') == 'FILTER_LOG_EVENTS':
            updated_task_def = {
                'source': 'CLOUDWATCH',
                'cloudwatch_task': {
                    'type': 'FILTER_LOG_EVENTS',
                    'filter_log_events_task': cloudwatch_task.get('filter_log_events', {})
                }
            }
        else:
            raise Exception(f"Task type {cloudwatch_task.get('type', None)} not supported")
    elif source == 'GRAFANA':
        grafana_task = task.get('grafana', {})
        if grafana_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
            promql_metric_execution_task = grafana_task.get('promql_metric_execution', {})
            datasource_uid = promql_metric_execution_task.pop('datasource_uid', None)
            updated_task_def = {
                'source': 'GRAFANA',
                'grafana_task': {
                    'type': 'PROMQL_METRIC_EXECUTION',
                    'datasource_uid': datasource_uid,
                    'promql_metric_execution_task': promql_metric_execution_task
                }
            }
        else:
            raise Exception(f"Task type {grafana_task.get('type', None)} not supported")
    elif source == 'NEW_RELIC':
        nr_task = task.get('new_relic', {})
        if nr_task.get('type', None) == 'ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'NEW_RELIC',
                'new_relic_task': {
                    'type': 'ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION',
                    'entity_application_golden_metric_execution_task': nr_task.get(
                        'entity_application_golden_metric_execution', {})
                }
            }
        elif nr_task.get('type', None) == 'ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'NEW_RELIC',
                'new_relic_task': {
                    'type': 'ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION',
                    'entity_dashboard_widget_nrql_metric_execution_task': nr_task.get(
                        'entity_dashboard_widget_nrql_metric_execution', {})
                }
            }
        elif nr_task.get('type', None) == 'NRQL_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'NEW_RELIC',
                'new_relic_task': {
                    'type': 'NRQL_METRIC_EXECUTION',
                    'nrql_metric_execution_task': nr_task.get('nrql_metric_execution', {})
                }
            }
        else:
            raise Exception(f"Task type {nr_task.get('type', None)} not supported")
    elif source == 'DATADOG':
        dd_task = task.get('datadog', {})
        if dd_task.get('type', None) == 'SERVICE_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'DATADOG',
                'datadog_task': {
                    'type': 'SERVICE_METRIC_EXECUTION',
                    'service_metric_execution_task': dd_task.get('service_metric_execution', {})
                }
            }
        elif dd_task.get('type', None) == 'QUERY_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'DATADOG',
                'datadog_task': {
                    'type': 'QUERY_METRIC_EXECUTION',
                    'query_metric_execution_task': dd_task.get('query_metric_execution', {})
                }
            }
        else:
            raise Exception(f"Task type {dd_task.get('type', None)} not supported")
    elif source == 'GRAFANA_MIMIR':
        mimir_task = task.get('grafana_mimir', {})
        if mimir_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
            updated_task_def = {
                'source': 'GRAFANA_MIMIR',
                'mimir_task': {
                    'type': 'PROMQL_METRIC_EXECUTION',
                    'promql_metric_execution_task': mimir_task.get('promql_metric_execution', {})
                }
            }
        else:
            raise Exception(f"Task type {mimir_task.get('type', None)} not supported")
    elif source == 'CLICKHOUSE':
        clickhouse_task = task.get('clickhouse', {})
        sql_query_task = clickhouse_task.get('sql_query', None)
        updated_task_def = {
            'source': 'CLICKHOUSE',
            'clickhouse_data_fetch_task': {
                'database': sql_query_task.get('database', None),
                'query': sql_query_task.get('query', None),
            }
        }
    elif source == 'POSTGRES':
        postgres_task = task.get('postgres', {})
        sql_query_task = postgres_task.get('sql_query', None)
        updated_task_def = {
            'source': 'POSTGRES',
            'postgres_data_fetch_task': {
                'database': sql_query_task.get('database', None),
                'query': sql_query_task.get('query', None),
            }
        }
    elif source == 'SQL_DATABASE_CONNECTION':
        sql_database_connection_task = task.get('sql_database_connection', {})
        sql_query_task = sql_database_connection_task.get('sql_query', None)
        updated_task_def = {
            'source': 'SQL_DATABASE_CONNECTION',
            'sql_database_connection_task': {
                'query': sql_query_task.get('query', None),
            }
        }
    elif source == 'EKS':
        eks_data_fetch_task = task.get('eks', {})
        command = eks_data_fetch_task.get('command', {})
        updated_task_def = {
            'source': 'EKS',
            'eks_data_fetch_task': {
                'command_type': command.get('type', None),
                'description': command.get('description', None),
                'region': command.get('region', None),
                'cluster': command.get('cluster', None),
                'namespace': command.get('namespace', None),
            }
        }
    elif source == 'API':
        api_call_task = task.get('api', {})
        updated_task_def = {
            'source': 'API',
            'api_call_task': {
                'method': api_call_task.get('http_request', {}).get('method', None),
                'url': api_call_task.get('http_request', {}).get('url', None),
                'headers': api_call_task.get('http_request', {}).get('headers', None),
                'payload': api_call_task.get('http_request', {}).get('payload', None),
                'timeout': api_call_task.get('http_request', {}).get('timeout', None),
                'cookies': api_call_task.get('http_request', {}).get('cookies', None),
            }
        }
    elif source == 'BASH':
        bash_command_task = task.get('bash', {})
        updated_task_def = {
            'source': 'BASH',
            'bash_command_task': bash_command_task.get('command', {})
        }
    elif source == 'DOCUMENTATION':
        documentation_task = task.get('documentation', {})
        updated_task_def = {
            'source': 'DOCUMENTATION',
            'documentation_task': {
                'documentation': documentation_task.get('content', None)
            }
        }
    else:
        raise ValueError(f"Invalid source: {source}")
    return updated_task_def
