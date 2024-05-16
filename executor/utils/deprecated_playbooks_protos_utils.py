from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from playbooks.utils.decorators import deprecated
from protos.base_pb2 import Source
from protos.playbooks.deprecated_playbook_pb2 import DeprecatedPlaybookMetricTaskDefinition, \
    DeprecatedPlaybookDataFetchTaskDefinition, DeprecatedPlaybookTaskDefinition, DeprecatedPlaybookActionTaskDefinition
from protos.playbooks.source_task_definitions.api_call_task_pb2 import PlaybookApiCallTask
from protos.playbooks.source_task_definitions.bash_command_task_pb2 import PlaybookBashCommandTask
from protos.playbooks.source_task_definitions.cloudwatch_task_pb2 import PlaybookCloudwatchTask, \
    CloudwatchMetricExecutionTask, CloudwatchFilterLogEventsTask
from protos.playbooks.source_task_definitions.datadog_task_pb2 import PlaybookDatadogTask, ServiceMetricExecutionTask, \
    QueryMetricExecutionTask
from protos.playbooks.source_task_definitions.documentation_task_pb2 import PlaybookDocumentationTaskDefinition
from protos.playbooks.source_task_definitions.eks_task_pb2 import PlaybookEksDataFetchTask
from protos.playbooks.source_task_definitions.grafana_task_pb2 import PlaybookGrafanaTask, PromQlMetricExecutionTask
from protos.playbooks.source_task_definitions.new_relic_task_pb2 import PlaybookNewRelicTask, \
    EntityApplicationGoldenMetricExecutionTask, EntityDashboardWidgetNRQLMetricExecutionTask, NRQLMetricExecutionTask
from protos.playbooks.source_task_definitions.promql_task_pb2 import PlaybookPromQLTask
from protos.playbooks.source_task_definitions.sql_database_task_pb2 import SqlDataFetchTask

from utils.proto_utils import dict_to_proto


@deprecated
def get_cloudwatch_task_execution_proto(task) -> DeprecatedPlaybookMetricTaskDefinition:
    cloudwatch_task = task.get('cloudwatch_task', {})
    if cloudwatch_task.get('type', None) == 'METRIC_EXECUTION':
        metric_execution_task_proto = dict_to_proto(cloudwatch_task.get('metric_execution_task', {}),
                                                    CloudwatchMetricExecutionTask)
        cloudwatch_task_proto = PlaybookCloudwatchTask(
            type=PlaybookCloudwatchTask.TaskType.METRIC_EXECUTION,
            metric_execution_task=metric_execution_task_proto)
    elif cloudwatch_task.get('type', None) == 'FILTER_LOG_EVENTS':
        filter_log_events_task_proto = dict_to_proto(cloudwatch_task.get('filter_log_events_task', {}),
                                                     CloudwatchFilterLogEventsTask)
        cloudwatch_task_proto = PlaybookCloudwatchTask(
            type=PlaybookCloudwatchTask.TaskType.FILTER_LOG_EVENTS,
            filter_log_events_task=filter_log_events_task_proto)
    else:
        raise Exception(f"Task type {cloudwatch_task.get('type', None)} not supported")
    return DeprecatedPlaybookMetricTaskDefinition(source=Source.CLOUDWATCH, cloudwatch_task=cloudwatch_task_proto)


@deprecated
def get_grafana_task_execution_proto(task) -> DeprecatedPlaybookMetricTaskDefinition:
    grafana_task = task.get('grafana_task', {})
    if grafana_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
        promql_metric_execution_task_proto = dict_to_proto(grafana_task.get('promql_metric_execution_task', {}),
                                                           PromQlMetricExecutionTask)
        grafana_task_proto = PlaybookGrafanaTask(type=PlaybookGrafanaTask.TaskType.PROMQL_METRIC_EXECUTION,
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
            PlaybookPromQLTask.PromQlMetricExecutionTask)
        mimir_task_proto = PlaybookPromQLTask(type=PlaybookPromQLTask.TaskType.PROMQL_METRIC_EXECUTION,
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
            EntityApplicationGoldenMetricExecutionTask)
        nr_task_proto = PlaybookNewRelicTask(
            type=PlaybookNewRelicTask.TaskType.ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION,
            entity_application_golden_metric_execution_task=entity_application_golden_metric_execution_task_proto)
    elif nr_task.get('type', None) == 'ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION':
        entity_dashboard_widget_nrql_metric_execution_task_proto = dict_to_proto(
            nr_task.get('entity_dashboard_widget_nrql_metric_execution_task', {}),
            EntityDashboardWidgetNRQLMetricExecutionTask)
        nr_task_proto = PlaybookNewRelicTask(
            type=PlaybookNewRelicTask.TaskType.ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION,
            entity_dashboard_widget_nrql_metric_execution_task=entity_dashboard_widget_nrql_metric_execution_task_proto)
    elif nr_task.get('type', None) == 'NRQL_METRIC_EXECUTION':
        nrql_metric_execution_task_proto = dict_to_proto(nr_task.get('nrql_metric_execution_task', {}),
                                                         NRQLMetricExecutionTask)
        nr_task_proto = PlaybookNewRelicTask(
            type=PlaybookNewRelicTask.TaskType.NRQL_METRIC_EXECUTION,
            nrql_metric_execution_task=nrql_metric_execution_task_proto)
    else:
        raise Exception(f"Task type {nr_task.get('type', None)} not supported")
    return DeprecatedPlaybookMetricTaskDefinition(source=Source.NEW_RELIC, new_relic_task=nr_task_proto)


@deprecated
def get_datadog_task_execution_proto(task) -> DeprecatedPlaybookMetricTaskDefinition:
    dd_task = task.get('datadog_task', {})
    if dd_task.get('type', None) == 'SERVICE_METRIC_EXECUTION':
        service_metric_execution_task_proto = dict_to_proto(dd_task.get('service_metric_execution_task', {}),
                                                            ServiceMetricExecutionTask)
        dd_task_proto = PlaybookDatadogTask(
            type=PlaybookDatadogTask.TaskType.SERVICE_METRIC_EXECUTION,
            service_metric_execution_task=service_metric_execution_task_proto)
    elif dd_task.get('type', None) == 'QUERY_METRIC_EXECUTION':
        query_metric_execution_task = dict_to_proto(dd_task.get('query_metric_execution_task', {}),
                                                    QueryMetricExecutionTask)
        dd_task_proto = PlaybookDatadogTask(
            type=PlaybookDatadogTask.TaskType.QUERY_METRIC_EXECUTION,
            query_metric_execution_task=query_metric_execution_task)
    else:
        raise Exception(f"Task type {dd_task.get('type', None)} not supported")
    return DeprecatedPlaybookMetricTaskDefinition(source=Source.DATADOG, datadog_task=dd_task_proto)


@deprecated
def get_clickhouse_task_execution_proto(task) -> DeprecatedPlaybookDataFetchTaskDefinition:
    clickhouse_data_fetch_task = task.get('clickhouse_data_fetch_task', {})
    clickhouse_data_fetch_task_proto = dict_to_proto(clickhouse_data_fetch_task, SqlDataFetchTask)
    return DeprecatedPlaybookDataFetchTaskDefinition(source=Source.CLICKHOUSE,
                                                     clickhouse_data_fetch_task=clickhouse_data_fetch_task_proto)


@deprecated
def get_postgres_task_execution_proto(task) -> DeprecatedPlaybookDataFetchTaskDefinition:
    postgres_data_fetch_task = task.get('postgres_data_fetch_task', {})
    postgres_data_fetch_task_proto = dict_to_proto(postgres_data_fetch_task, SqlDataFetchTask)
    return DeprecatedPlaybookDataFetchTaskDefinition(source=Source.POSTGRES,
                                                     postgres_data_fetch_task=postgres_data_fetch_task_proto)


@deprecated
def get_sql_database_connection_task_execution_proto(task) -> DeprecatedPlaybookDataFetchTaskDefinition:
    sql_database_connection_data_fetch_task = task.get('sql_database_connection_data_fetch_task', {})
    sql_database_connection_data_fetch_task_proto = dict_to_proto(sql_database_connection_data_fetch_task,
                                                                  SqlDataFetchTask)
    return DeprecatedPlaybookDataFetchTaskDefinition(source=Source.SQL_DATABASE_CONNECTION,
                                                     sql_database_connection_data_fetch_task=sql_database_connection_data_fetch_task_proto)


@deprecated
def get_eks_task_execution_proto(task) -> DeprecatedPlaybookDataFetchTaskDefinition:
    eks_data_fetch_task = task.get('eks_data_fetch_task', {})
    eks_data_fetch_task_proto = dict_to_proto(eks_data_fetch_task, PlaybookEksDataFetchTask)
    return DeprecatedPlaybookDataFetchTaskDefinition(source=Source.EKS, eks_data_fetch_task=eks_data_fetch_task_proto)


@deprecated
def get_api_call_task_execution_proto(task) -> DeprecatedPlaybookActionTaskDefinition:
    api_call_task = task.get('api_call_task', {})
    api_call_task_proto = dict_to_proto(api_call_task, PlaybookApiCallTask)
    return DeprecatedPlaybookActionTaskDefinition(source=Source.API, api_call_task=api_call_task_proto)


@deprecated
def get_bash_command_task_execution_proto(task) -> DeprecatedPlaybookActionTaskDefinition:
    bash_command_task = task.get('bash_command_task', {})
    bash_command_task_proto = dict_to_proto(bash_command_task, PlaybookBashCommandTask)
    return DeprecatedPlaybookActionTaskDefinition(source=Source.BASH, bash_command_task=bash_command_task_proto)


@deprecated
def get_playbook_task_definition_proto(db_task_definition):
    task = db_task_definition.task
    source = task.get('source', None)
    if source in ['CLOUDWATCH', 'GRAFANA', 'NEW_RELIC', 'DATADOG']:
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
        documentation_task_proto = dict_to_proto(db_task_definition.task, PlaybookDocumentationTaskDefinition)
        return DeprecatedPlaybookTaskDefinition(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=DeprecatedPlaybookTaskDefinition.Type.DOCUMENTATION,
            documentation_task=documentation_task_proto,
            notes=StringValue(value=db_task_definition.notes),
        )
    else:
        raise ValueError(f"Invalid source: {source}")
