from google.protobuf.wrappers_pb2 import StringValue

from protos.base_pb2 import Source
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, PlaybookTaskResultType, \
    TableResult
from protos.playbooks.playbook_pb2 import PlaybookTaskExecutionResult, PlaybookMetricTaskExecutionResult, \
    PlaybookDataFetchTaskExecutionResult, PlaybookActionTaskExecutionResult


def transform_PlaybookTaskExecutionResult_to_PlaybookTaskResult(old_result: PlaybookTaskExecutionResult):
    if old_result.error and old_result.error.value:
        return PlaybookTaskResult(error=old_result.error)
    which_oneof = old_result.WhichOneof('result')
    if which_oneof == 'metric_task_execution_result':
        metric_task_result: PlaybookMetricTaskExecutionResult = old_result.metric_task_execution_result
        metric_task_result_type = metric_task_result.result.type
        if metric_task_result_type == PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES:
            timeseries_result = TimeseriesResult(
                metric_name=metric_task_result.metric_name,
                metric_expression=metric_task_result.metric_expression,
                labeled_metric_timeseries=metric_task_result.result.timeseries.labeled_metric_timeseries
            )
            return PlaybookTaskResult(source=metric_task_result.metric_source, timeseries=timeseries_result,
                                      type=PlaybookTaskResultType.TIMESERIES)
        elif metric_task_result_type == PlaybookMetricTaskExecutionResult.Result.Type.TABLE_RESULT:
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
        data_fetch_task_result: PlaybookDataFetchTaskExecutionResult = old_result.data_fetch_task_execution_result
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
        action_task_result: PlaybookActionTaskExecutionResult = old_result.action_task_execution_result
        if action_task_result.result.type == PlaybookActionTaskExecutionResult.Result.Type.BASH_COMMAND_OUTPUT:
            bash_command_output = action_task_result.result.bash_command_output
            return PlaybookTaskResult(source=Source.BASH, type=PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                                      bash_command_output=bash_command_output)
        elif action_task_result.result.type == PlaybookActionTaskExecutionResult.Result.Type.API_RESPONSE:
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
                'metric_name': metric_task_result['metric_name'],
                'metric_expression': metric_task_result['metric_expression'],
                'labeled_metric_timeseries': metric_task_result['result']['timeseries']['labeled_metric_timeseries']
            }
            return {
                'source': metric_task_result['metric_source'],
                'timeseries': timeseries_result,
                'type': 'TIMESERIES'
            }

        elif metric_task_result_type == 'TABLE_RESULT':
            table_result = {
                'rows': metric_task_result['result']['table_result']['rows'],
                'raw_query': metric_task_result['metric_expression'],
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
            'rows': data_fetch_task_result['result']['table_result']['rows'],
            'raw_query': data_fetch_task_result['result']['table_result']['raw_query'],
            'limit': data_fetch_task_result['result']['table_result']['limit'],
            'offset': data_fetch_task_result['result']['table_result']['offset'],
            'total_count': data_fetch_task_result['result']['table_result']['total_count']
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
        new_result: PlaybookTaskResult) -> PlaybookTaskExecutionResult:
    if new_result.error and new_result.error.value:
        return PlaybookTaskExecutionResult(error=new_result.error)
    elif new_result.type == PlaybookTaskResultType.TIMESERIES:
        return PlaybookTaskExecutionResult(
            metric_task_execution_result=PlaybookMetricTaskExecutionResult(
                metric_name=new_result.timeseries.metric_name,
                metric_expression=new_result.timeseries.metric_expression,
                metric_source=new_result.source,
                result=PlaybookMetricTaskExecutionResult.Result(
                    type=PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
                    timeseries=TimeseriesResult(
                        labeled_metric_timeseries=new_result.timeseries.labeled_metric_timeseries
                    )
                )
            )
        )
    elif new_result.type == PlaybookTaskResultType.TABLE and new_result.source in [Source.CLOUDWATCH]:
        return PlaybookTaskExecutionResult(
            metric_task_execution_result=PlaybookMetricTaskExecutionResult(
                metric_name=StringValue(value='log_events'),
                metric_expression=new_result.table.raw_query,
                metric_source=new_result.source,
                result=PlaybookMetricTaskExecutionResult.Result(
                    type=PlaybookMetricTaskExecutionResult.Result.Type.TABLE_RESULT,
                    table_result=TableResult(
                        rows=new_result.table.rows
                    )
                )
            )
        )
    elif new_result.type == PlaybookTaskResultType.TABLE:
        return PlaybookTaskExecutionResult(
            data_fetch_task_execution_result=PlaybookDataFetchTaskExecutionResult(
                data_source=new_result.source,
                result=PlaybookDataFetchTaskExecutionResult.Result(
                    type=PlaybookDataFetchTaskExecutionResult.Result.Type.TABLE_RESULT,
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
        return PlaybookTaskExecutionResult(
            action_task_execution_result=PlaybookActionTaskExecutionResult(
                result=PlaybookActionTaskExecutionResult.Result(
                    type=PlaybookActionTaskExecutionResult.Result.Type.BASH_COMMAND_OUTPUT,
                    bash_command_output=new_result.bash_command_output
                )
            )
        )
    elif new_result.type == PlaybookTaskResultType.API_RESPONSE:
        return PlaybookTaskExecutionResult(
            action_task_execution_result=PlaybookActionTaskExecutionResult(
                result=PlaybookActionTaskExecutionResult.Result(
                    type=PlaybookActionTaskExecutionResult.Result.Type.API_RESPONSE,
                    api_response=new_result.api_response
                )
            )
        )
    else:
        raise ValueError(f'Unsupported task result type: {new_result.type}')
