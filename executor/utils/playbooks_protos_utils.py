from google.protobuf.wrappers_pb2 import StringValue

from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition, PlaybookCloudwatchTask, PlaybookGrafanaTask, \
    PlaybookNewRelicTask, PlaybookDatadogTask, PlaybookDataFetchTaskDefinition, PlaybookClickhouseDataFetchTask, \
    PlaybookPostgresDataFetchTask, PlaybookEksDataFetchTask
from utils.proto_utils import dict_to_proto


def get_cloudwatch_task_execution_proto(task) -> PlaybookMetricTaskDefinition:
    cloudwatch_task = task.get('cloudwatch_task', {})
    if cloudwatch_task.get('type', None) == 'METRIC_EXECUTION':
        metric_execution_task_proto = dict_to_proto(cloudwatch_task.get('metric_execution_task', {}),
                                                    PlaybookCloudwatchTask.CloudwatchMetricExecutionTask)
        cloudwatch_task_proto = PlaybookCloudwatchTask(
            type=PlaybookCloudwatchTask.TaskType.METRIC_EXECUTION,
            metric_execution_task=metric_execution_task_proto)
        return PlaybookMetricTaskDefinition(
            source=PlaybookMetricTaskDefinition.Source.CLOUDWATCH,
            cloudwatch_task=cloudwatch_task_proto)
    elif cloudwatch_task.get('type', None) == 'FILTER_LOG_EVENTS':
        filter_log_events_task_proto = dict_to_proto(cloudwatch_task.get('filter_log_events_task', {}),
                                                     PlaybookCloudwatchTask.CloudwatchFilterLogEventsTask)
        cloudwatch_task_proto = PlaybookCloudwatchTask(
            type=PlaybookCloudwatchTask.TaskType.FILTER_LOG_EVENTS,
            filter_log_events_task=filter_log_events_task_proto)
    else:
        raise Exception(f"Task type {cloudwatch_task.get('type', None)} not supported")
    return PlaybookMetricTaskDefinition(
        source=PlaybookMetricTaskDefinition.Source.CLOUDWATCH,
        cloudwatch_task=cloudwatch_task_proto)


def get_grafana_task_execution_proto(task) -> PlaybookMetricTaskDefinition:
    grafana_task = task.get('grafana_task', {})
    if grafana_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
        promql_metric_execution_task_proto = dict_to_proto(
            grafana_task.get('promql_metric_execution_task', {}),
            PlaybookGrafanaTask.PromQlMetricExecutionTask)
        grafana_task_proto = PlaybookGrafanaTask(type=PlaybookGrafanaTask.TaskType.PROMQL_METRIC_EXECUTION,
                                                 datasource_uid=StringValue(
                                                     value=grafana_task.get('datasource_uid', '')),
                                                 promql_metric_execution_task=promql_metric_execution_task_proto)
    else:
        raise Exception(f"Task type {grafana_task.get('type', None)} not supported")
    return PlaybookMetricTaskDefinition(
        source=PlaybookMetricTaskDefinition.Source.GRAFANA,
        grafana_task=grafana_task_proto)


def get_new_relic_task_execution_proto(task) -> PlaybookMetricTaskDefinition:
    nr_task = task.get('new_relic_task', {})
    if nr_task.get('type', None) == 'ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION':
        entity_application_golden_metric_execution_task_proto = dict_to_proto(
            nr_task.get('entity_application_golden_metric_execution_task', {}),
            PlaybookNewRelicTask.EntityApplicationGoldenMetricExecutionTask)
        nr_task_proto = PlaybookNewRelicTask(
            type=PlaybookNewRelicTask.TaskType.ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION,
            entity_application_golden_metric_execution_task=entity_application_golden_metric_execution_task_proto)
    elif nr_task.get('type', None) == 'ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION':
        entity_dashboard_widget_nrql_metric_execution_task_proto = dict_to_proto(
            nr_task.get('entity_dashboard_widget_nrql_metric_execution_task', {}),
            PlaybookNewRelicTask.EntityDashboardWidgetNRQLMetricExecutionTask)
        nr_task_proto = PlaybookNewRelicTask(
            type=PlaybookNewRelicTask.TaskType.ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION,
            entity_dashboard_widget_nrql_metric_execution_task=entity_dashboard_widget_nrql_metric_execution_task_proto)
    elif nr_task.get('type', None) == 'NRQL_METRIC_EXECUTION':
        nrql_metric_execution_task_proto = dict_to_proto(
            nr_task.get('nrql_metric_execution_task', {}),
            PlaybookNewRelicTask.NRQLMetricExecutionTask)
        nr_task_proto = PlaybookNewRelicTask(
            type=PlaybookNewRelicTask.TaskType.NRQL_METRIC_EXECUTION,
            nrql_metric_execution_task=nrql_metric_execution_task_proto)
    else:
        raise Exception(f"Task type {nr_task.get('type', None)} not supported")
    return PlaybookMetricTaskDefinition(
        source=PlaybookMetricTaskDefinition.Source.NEW_RELIC,
        new_relic_task=nr_task_proto)


def get_datadog_task_execution_proto(task) -> PlaybookMetricTaskDefinition:
    dd_task = task.get('datadog_task', {})
    if dd_task.get('type', None) == 'SERVICE_METRIC_EXECUTION':
        service_metric_execution_task_proto = dict_to_proto(
            dd_task.get('service_metric_execution_task', {}),
            PlaybookDatadogTask.ServiceMetricExecutionTask)
        dd_task_proto = PlaybookDatadogTask(
            type=PlaybookDatadogTask.TaskType.SERVICE_METRIC_EXECUTION,
            service_metric_execution_task=service_metric_execution_task_proto)
    else:
        raise Exception(f"Task type {dd_task.get('type', None)} not supported")
    return PlaybookMetricTaskDefinition(
        source=PlaybookMetricTaskDefinition.Source.DATADOG,
        datadog_task=dd_task_proto)


def get_clickhouse_task_execution_proto(task) -> PlaybookDataFetchTaskDefinition:
    clickhouse_data_fetch_task = task.get('clickhouse_data_fetch_task', {})
    clickhouse_data_fetch_task_proto = dict_to_proto(clickhouse_data_fetch_task, PlaybookClickhouseDataFetchTask)
    return PlaybookDataFetchTaskDefinition(source=PlaybookDataFetchTaskDefinition.Source.CLICKHOUSE,
                                           clickhouse_data_fetch_task=clickhouse_data_fetch_task_proto)


def get_postgres_task_execution_proto(task) -> PlaybookDataFetchTaskDefinition:
    postgres_data_fetch_task = task.get('postgres_data_fetch_task', {})
    postgres_data_fetch_task_proto = dict_to_proto(postgres_data_fetch_task, PlaybookPostgresDataFetchTask)
    return PlaybookDataFetchTaskDefinition(source=PlaybookDataFetchTaskDefinition.Source.POSTGRES,
                                           postgres_data_fetch_task=postgres_data_fetch_task_proto)


def get_eks_task_execution_proto(task) -> PlaybookDataFetchTaskDefinition:
    eks_data_fetch_task = task.get('eks_data_fetch_task', {})
    eks_data_fetch_task_proto = dict_to_proto(eks_data_fetch_task, PlaybookEksDataFetchTask)
    return PlaybookDataFetchTaskDefinition(source=PlaybookDataFetchTaskDefinition.Source.EKS,
                                           eks_data_fetch_task=eks_data_fetch_task_proto)
