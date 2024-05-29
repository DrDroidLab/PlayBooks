from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from executor.utils.old_to_new_model_transformers import transform_new_task_definition_to_old
from playbooks.utils.decorators import deprecated
from protos.base_pb2 import Source
from protos.playbooks.deprecated_playbook_pb2 import DeprecatedPlaybookMetricTaskDefinition, \
    DeprecatedPlaybookTaskDefinition, DeprecatedPlaybookCloudwatchTask, DeprecatedPlaybookGrafanaTask, \
    DeprecatedPlaybookNewRelicTask, DeprecatedPlaybookDatadogTask, DeprecatedPlaybookDataFetchTaskDefinition, \
    DeprecatedPlaybookClickhouseDataFetchTask, DeprecatedPlaybookPostgresDataFetchTask, \
    DeprecatedPlaybookEksDataFetchTask, DeprecatedPlaybookPromQLTask, \
    DeprecatedPlaybookSqlDatabaseConnectionDataFetchTask, DeprecatedPlaybookActionTaskDefinition, \
    DeprecatedPlaybookApiCallTask, DeprecatedPlaybookBashCommandTask, DeprecatedPlaybookDocumentationTaskDefinition

from utils.proto_utils import dict_to_proto


@deprecated
def get_cloudwatch_task_execution_proto(task) -> DeprecatedPlaybookMetricTaskDefinition:
    cloudwatch_task = task.get('cloudwatch_task', {})
    if cloudwatch_task.get('type', None) == 'METRIC_EXECUTION':
        metric_execution_task_proto = dict_to_proto(cloudwatch_task.get('metric_execution_task', {}),
                                                    DeprecatedPlaybookCloudwatchTask.DeprecatedCloudwatchMetricExecutionTask)
        cloudwatch_task_proto = DeprecatedPlaybookCloudwatchTask(
            type=DeprecatedPlaybookCloudwatchTask.TaskType.METRIC_EXECUTION,
            metric_execution_task=metric_execution_task_proto)
    elif cloudwatch_task.get('type', None) == 'FILTER_LOG_EVENTS':
        filter_log_events_task_proto = dict_to_proto(cloudwatch_task.get('filter_log_events_task', {}),
                                                     DeprecatedPlaybookCloudwatchTask.DeprecatedCloudwatchFilterLogEventsTask)
        cloudwatch_task_proto = DeprecatedPlaybookCloudwatchTask(
            type=DeprecatedPlaybookCloudwatchTask.TaskType.FILTER_LOG_EVENTS,
            filter_log_events_task=filter_log_events_task_proto)
    else:
        raise Exception(f"Task type {cloudwatch_task.get('type', None)} not supported")
    return DeprecatedPlaybookMetricTaskDefinition(source=Source.CLOUDWATCH, cloudwatch_task=cloudwatch_task_proto)


@deprecated
def get_grafana_task_execution_proto(task) -> DeprecatedPlaybookMetricTaskDefinition:
    grafana_task = task.get('grafana_task', {})
    if grafana_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
        promql_metric_execution_task_proto = dict_to_proto(grafana_task.get('promql_metric_execution_task', {}),
                                                           DeprecatedPlaybookGrafanaTask.DeprecatedPromQlMetricExecutionTask)
        grafana_task_proto = DeprecatedPlaybookGrafanaTask(
            type=DeprecatedPlaybookGrafanaTask.TaskType.PROMQL_METRIC_EXECUTION,
            datasource_uid=StringValue(
                value=grafana_task.get('datasource_uid', '')),
            promql_metric_execution_task=promql_metric_execution_task_proto)
    else:
        raise Exception(f"Task type {grafana_task.get('type', None)} not supported")
    return DeprecatedPlaybookMetricTaskDefinition(source=Source.GRAFANA, grafana_task=grafana_task_proto)


@deprecated
def get_grafana_mimir_task_execution_proto(task) -> DeprecatedPlaybookMetricTaskDefinition:
    mimir_task = task.get('mimir_task', {})
    if mimir_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
        promql_metric_execution_task_proto = dict_to_proto(
            mimir_task.get('promql_metric_execution_task', {}),
            DeprecatedPlaybookPromQLTask.DeprecatedPromQlMetricExecutionTask)
        mimir_task_proto = DeprecatedPlaybookPromQLTask(
            type=DeprecatedPlaybookPromQLTask.TaskType.PROMQL_METRIC_EXECUTION,
            promql_metric_execution_task=promql_metric_execution_task_proto)
    else:
        raise Exception(f"Task type {mimir_task.get('type', None)} not supported")
    return DeprecatedPlaybookMetricTaskDefinition(
        source=Source.GRAFANA_MIMIR,
        mimir_task=mimir_task_proto)


@deprecated
def get_new_relic_task_execution_proto(task) -> DeprecatedPlaybookMetricTaskDefinition:
    nr_task = task.get('new_relic_task', {})
    if nr_task.get('type', None) == 'ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION':
        entity_application_golden_metric_execution_task_proto = dict_to_proto(
            nr_task.get('entity_application_golden_metric_execution_task', {}),
            DeprecatedPlaybookNewRelicTask.DeprecatedEntityApplicationGoldenMetricExecutionTask)
        nr_task_proto = DeprecatedPlaybookNewRelicTask(
            type=DeprecatedPlaybookNewRelicTask.TaskType.ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION,
            entity_application_golden_metric_execution_task=entity_application_golden_metric_execution_task_proto)
    elif nr_task.get('type', None) == 'ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION':
        entity_dashboard_widget_nrql_metric_execution_task_proto = dict_to_proto(
            nr_task.get('entity_dashboard_widget_nrql_metric_execution_task', {}),
            DeprecatedPlaybookNewRelicTask.DeprecatedEntityDashboardWidgetNRQLMetricExecutionTask)
        nr_task_proto = DeprecatedPlaybookNewRelicTask(
            type=DeprecatedPlaybookNewRelicTask.TaskType.ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION,
            entity_dashboard_widget_nrql_metric_execution_task=entity_dashboard_widget_nrql_metric_execution_task_proto)
    elif nr_task.get('type', None) == 'NRQL_METRIC_EXECUTION':
        nrql_metric_execution_task_proto = dict_to_proto(nr_task.get('nrql_metric_execution_task', {}),
                                                         DeprecatedPlaybookNewRelicTask.DeprecatedNRQLMetricExecutionTask)
        nr_task_proto = DeprecatedPlaybookNewRelicTask(
            type=DeprecatedPlaybookNewRelicTask.TaskType.NRQL_METRIC_EXECUTION,
            nrql_metric_execution_task=nrql_metric_execution_task_proto)
    else:
        raise Exception(f"Task type {nr_task.get('type', None)} not supported")
    return DeprecatedPlaybookMetricTaskDefinition(source=Source.NEW_RELIC, new_relic_task=nr_task_proto)


@deprecated
def get_datadog_task_execution_proto(task) -> DeprecatedPlaybookMetricTaskDefinition:
    dd_task = task.get('datadog_task', {})
    if dd_task.get('type', None) == 'SERVICE_METRIC_EXECUTION':
        service_metric_execution_task_proto = dict_to_proto(dd_task.get('service_metric_execution_task', {}),
                                                            DeprecatedPlaybookDatadogTask.DeprecatedServiceMetricExecutionTask)
        dd_task_proto = DeprecatedPlaybookDatadogTask(
            type=DeprecatedPlaybookDatadogTask.TaskType.SERVICE_METRIC_EXECUTION,
            service_metric_execution_task=service_metric_execution_task_proto)
    elif dd_task.get('type', None) == 'QUERY_METRIC_EXECUTION':
        query_metric_execution_task = dict_to_proto(dd_task.get('query_metric_execution_task', {}),
                                                    DeprecatedPlaybookDatadogTask.DeprecatedQueryMetricExecutionTask)
        dd_task_proto = DeprecatedPlaybookDatadogTask(
            type=DeprecatedPlaybookDatadogTask.TaskType.QUERY_METRIC_EXECUTION,
            query_metric_execution_task=query_metric_execution_task)
    else:
        raise Exception(f"Task type {dd_task.get('type', None)} not supported")
    return DeprecatedPlaybookMetricTaskDefinition(source=Source.DATADOG, datadog_task=dd_task_proto)


@deprecated
def get_clickhouse_task_execution_proto(task) -> DeprecatedPlaybookDataFetchTaskDefinition:
    clickhouse_data_fetch_task = task.get('clickhouse_data_fetch_task', {})
    clickhouse_data_fetch_task_proto = dict_to_proto(clickhouse_data_fetch_task,
                                                     DeprecatedPlaybookClickhouseDataFetchTask)
    return DeprecatedPlaybookDataFetchTaskDefinition(source=Source.CLICKHOUSE,
                                                     clickhouse_data_fetch_task=clickhouse_data_fetch_task_proto)


@deprecated
def get_postgres_task_execution_proto(task) -> DeprecatedPlaybookDataFetchTaskDefinition:
    postgres_data_fetch_task = task.get('postgres_data_fetch_task', {})
    postgres_data_fetch_task_proto = dict_to_proto(postgres_data_fetch_task, DeprecatedPlaybookPostgresDataFetchTask)
    return DeprecatedPlaybookDataFetchTaskDefinition(source=Source.POSTGRES,
                                                     postgres_data_fetch_task=postgres_data_fetch_task_proto)


@deprecated
def get_sql_database_connection_task_execution_proto(task) -> DeprecatedPlaybookDataFetchTaskDefinition:
    sql_database_connection_data_fetch_task = task.get('sql_database_connection_data_fetch_task', {})
    sql_database_connection_data_fetch_task_proto = dict_to_proto(sql_database_connection_data_fetch_task,
                                                                  DeprecatedPlaybookSqlDatabaseConnectionDataFetchTask)
    return DeprecatedPlaybookDataFetchTaskDefinition(source=Source.SQL_DATABASE_CONNECTION,
                                                     sql_database_connection_data_fetch_task=sql_database_connection_data_fetch_task_proto)


@deprecated
def get_eks_task_execution_proto(task) -> DeprecatedPlaybookDataFetchTaskDefinition:
    eks_data_fetch_task = task.get('eks_data_fetch_task', {})
    eks_data_fetch_task_proto = dict_to_proto(eks_data_fetch_task, DeprecatedPlaybookEksDataFetchTask)
    return DeprecatedPlaybookDataFetchTaskDefinition(source=Source.EKS, eks_data_fetch_task=eks_data_fetch_task_proto)


@deprecated
def get_api_call_task_execution_proto(task) -> DeprecatedPlaybookActionTaskDefinition:
    api_call_task = task.get('api_call_task', {})
    api_call_task_proto = dict_to_proto(api_call_task, DeprecatedPlaybookApiCallTask)
    return DeprecatedPlaybookActionTaskDefinition(source=Source.API, api_call_task=api_call_task_proto)


@deprecated
def get_bash_command_task_execution_proto(task) -> DeprecatedPlaybookActionTaskDefinition:
    bash_command_task = task.get('bash_command_task', {})
    bash_command_task_proto = dict_to_proto(bash_command_task, DeprecatedPlaybookBashCommandTask)
    return DeprecatedPlaybookActionTaskDefinition(source=Source.BASH, bash_command_task=bash_command_task_proto)


@deprecated
def get_playbook_task_definition_proto(db_task_definition):
    new_definition_task = db_task_definition.task
    print('###### new_definition_task', new_definition_task)
    task = transform_new_task_definition_to_old(new_definition_task)
    print('###### task', task)
    source = task.get('source', None)
    if source in ['CLOUDWATCH', 'GRAFANA', 'NEW_RELIC', 'DATADOG', 'GRAFANA_MIMIR']:
        if source == 'CLOUDWATCH':
            metric_task_proto = get_cloudwatch_task_execution_proto(task)
        elif source == 'GRAFANA':
            metric_task_proto = get_grafana_task_execution_proto(task)
        elif source == 'NEW_RELIC':
            metric_task_proto = get_new_relic_task_execution_proto(task)
        elif source == 'DATADOG':
            metric_task_proto = get_datadog_task_execution_proto(task)
        elif source == 'GRAFANA_MIMIR':
            metric_task_proto = get_grafana_mimir_task_execution_proto(task)
        else:
            print('#################### - 1')
            raise ValueError(f"Invalid source: {source}")
        return DeprecatedPlaybookTaskDefinition(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=DeprecatedPlaybookTaskDefinition.Type.METRIC,
            metric_task=metric_task_proto,
            notes=StringValue(value=db_task_definition.notes)
        )
    elif source in ['CLICKHOUSE', 'POSTGRES', 'EKS', 'SQL_DATABASE_CONNECTION']:
        source = task.get('source', None)
        if source == 'CLICKHOUSE':
            data_fetch_task_proto = get_clickhouse_task_execution_proto(task)
        elif source == 'POSTGRES':
            data_fetch_task_proto = get_postgres_task_execution_proto(task)
        elif source == 'EKS':
            data_fetch_task_proto = get_eks_task_execution_proto(task)
        elif source == 'SQL_DATABASE_CONNECTION':
            data_fetch_task_proto = get_sql_database_connection_task_execution_proto(task)
        else:
            print('#################### - 2')
            raise ValueError(f"Invalid source: {source}")
        return DeprecatedPlaybookTaskDefinition(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=DeprecatedPlaybookTaskDefinition.Type.DATA_FETCH,
            data_fetch_task=data_fetch_task_proto,
            notes=StringValue(value=db_task_definition.notes),
        )
    elif source in ['API', 'BASH']:
        source = task.get('source', None)
        if source == 'API':
            action_task_proto = get_api_call_task_execution_proto(task)
        elif source == 'BASH':
            action_task_proto = get_bash_command_task_execution_proto(task)
        else:
            print('#################### - 3')
            raise ValueError(f"Invalid source: {source}")
        return DeprecatedPlaybookTaskDefinition(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=DeprecatedPlaybookTaskDefinition.Type.ACTION,
            action_task=action_task_proto,
            notes=StringValue(value=db_task_definition.notes)
        )
    elif task.get('documentation_task', None):
        documentation_task_proto = dict_to_proto(db_task_definition.task, DeprecatedPlaybookDocumentationTaskDefinition)
        return DeprecatedPlaybookTaskDefinition(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=DeprecatedPlaybookTaskDefinition.Type.DOCUMENTATION,
            documentation_task=documentation_task_proto,
            notes=StringValue(value=db_task_definition.notes),
        )
    elif task.get('iframe_task', None):
        iframe_task_proto = dict_to_proto(db_task_definition.task, DeprecatedPlaybookDocumentationTaskDefinition)
        return DeprecatedPlaybookTaskDefinition(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=DeprecatedPlaybookTaskDefinition.Type.DOCUMENTATION,
            documentation_task=iframe_task_proto,
            notes=StringValue(value=db_task_definition.notes),
        )
    else:
        print('#################### - 4')
        raise ValueError(f"Invalid source: {source}")
