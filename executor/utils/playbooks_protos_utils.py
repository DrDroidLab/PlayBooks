from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition, PlaybookCloudwatchTask, PlaybookGrafanaTask, \
    PlaybookNewRelicTask, PlaybookDatadogTask, PlaybookDataFetchTaskDefinition, PlaybookClickhouseDataFetchTask, \
    PlaybookPostgresDataFetchTask, PlaybookEksDataFetchTask, PlaybookPromQLTask, PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    ElseEvaluationTask, PlaybookDecisionTaskDefinition as PlaybookDecisionTaskDefinitionProto, \
    PlaybookMetricTaskExecutionResult as PlaybookMetricTaskExecutionResultProto, \
    TimeseriesEvaluationTask as TimeseriesEvaluationTaskProto, \
    PlaybookDocumentationTaskDefinition as PlaybookDocumentationTaskDefinitionProto, \
    PlaybookSqlDatabaseConnectionDataFetchTask, PlaybookActionTaskDefinition, PlaybookApiCallTask
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


def get_grafana_mimir_task_execution_proto(task) -> PlaybookMetricTaskDefinition:
    mimir_task = task.get('mimir_task', {})
    if mimir_task.get('type', None) == 'PROMQL_METRIC_EXECUTION':
        promql_metric_execution_task_proto = dict_to_proto(
            mimir_task.get('promql_metric_execution_task', {}),
            PlaybookPromQLTask.PromQlMetricExecutionTask)
        mimir_task_proto = PlaybookPromQLTask(type=PlaybookPromQLTask.TaskType.PROMQL_METRIC_EXECUTION,
                                                 promql_metric_execution_task=promql_metric_execution_task_proto)
    else:
        raise Exception(f"Task type {mimir_task.get('type', None)} not supported")
    return PlaybookMetricTaskDefinition(
        source=PlaybookMetricTaskDefinition.Source.GRAFANA_MIMIR,
        mimir_task=mimir_task_proto)


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
    elif dd_task.get('type', None) == 'QUERY_METRIC_EXECUTION':
        query_metric_execution_task = dict_to_proto(
            dd_task.get('query_metric_execution_task', {}),
            PlaybookDatadogTask.QueryMetricExecutionTask)
        dd_task_proto = PlaybookDatadogTask(
            type=PlaybookDatadogTask.TaskType.QUERY_METRIC_EXECUTION,
            query_metric_execution_task=query_metric_execution_task)
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


def get_sql_database_connection_task_execution_proto(task) -> PlaybookDataFetchTaskDefinition:
    sql_database_connection_data_fetch_task = task.get('sql_database_connection_data_fetch_task', {})
    sql_database_connection_data_fetch_task_proto = dict_to_proto(sql_database_connection_data_fetch_task,
                                                                  PlaybookSqlDatabaseConnectionDataFetchTask)
    return PlaybookDataFetchTaskDefinition(source=PlaybookDataFetchTaskDefinition.Source.SQL_DATABASE_CONNECTION,
                                           sql_database_connection_data_fetch_task=sql_database_connection_data_fetch_task_proto)


def get_eks_task_execution_proto(task) -> PlaybookDataFetchTaskDefinition:
    eks_data_fetch_task = task.get('eks_data_fetch_task', {})
    eks_data_fetch_task_proto = dict_to_proto(eks_data_fetch_task, PlaybookEksDataFetchTask)
    return PlaybookDataFetchTaskDefinition(source=PlaybookDataFetchTaskDefinition.Source.EKS,
                                           eks_data_fetch_task=eks_data_fetch_task_proto)


def get_api_call_task_execution_proto(task) -> PlaybookActionTaskDefinition:
    api_call_task = task.get('api_call_task', {})
    api_call_task_proto = dict_to_proto(api_call_task, PlaybookApiCallTask)
    return PlaybookActionTaskDefinition(source=PlaybookActionTaskDefinition.Source.API,
                                        api_call_task=api_call_task_proto)


def get_playbook_task_definition_proto(db_task_definition):
    task_type = db_task_definition.type
    task = db_task_definition.task
    if task_type == PlaybookTaskDefinitionProto.Type.DECISION:
        decision_task = task.get('decision_task', None)
        if decision_task.get('evaluation_type', None) == 'ELSE':
            else_evaluation_task_proto = dict_to_proto(decision_task.get('else_evaluation_task', {}),
                                                       ElseEvaluationTask)
            decision_task_proto = PlaybookDecisionTaskDefinitionProto(
                evaluation_type=PlaybookTaskDefinitionProto.DecisionTask.EvaluationType.ELSE,
                else_evaluation_task=else_evaluation_task_proto
            )
            return PlaybookTaskDefinitionProto(
                id=UInt64Value(value=db_task_definition.id),
                name=StringValue(value=db_task_definition.name),
                description=StringValue(value=db_task_definition.description),
                type=db_task_definition.type,
                decision_task=decision_task_proto,
                notes=StringValue(value=db_task_definition.notes),
                interpreter_type=db_task_definition.interpreter_type
            )
        elif decision_task.get('evaluation_type', None) == 'TIMESERIES':
            timeseries_evaluation_task = decision_task.get('timeseries_evaluation_task', {})
            if timeseries_evaluation_task.get('input_type', None) == 'METRIC_TIMESERIES':
                metric_timeseries_input = dict_to_proto(
                    timeseries_evaluation_task.get('metric_timeseries_input', {}),
                    PlaybookMetricTaskExecutionResultProto)
                rules_proto = dict_to_proto(decision_task.get('rule', {}), TimeseriesEvaluationTaskProto.Rule)
                timeseries_evaluation_task_proto = TimeseriesEvaluationTaskProto(
                    input_type=PlaybookTaskDefinitionProto.TimeseriesEvaluationTask.InputType.METRIC_TIMESERIES,
                    rules=rules_proto,
                    metric_timeseries_input=metric_timeseries_input
                )
                decision_task_proto = PlaybookDecisionTaskDefinitionProto(
                    evaluation_type=PlaybookTaskDefinitionProto.DecisionTask.EvaluationType.TIMESERIES,
                    timeseries_evaluation_task=timeseries_evaluation_task_proto
                )
                return PlaybookTaskDefinitionProto(
                    id=UInt64Value(value=db_task_definition.id),
                    name=StringValue(value=db_task_definition.name),
                    description=StringValue(value=db_task_definition.description),
                    notes=StringValue(value=db_task_definition.notes),
                    type=db_task_definition.type, decision_task=decision_task_proto,
                    interpreter_type=db_task_definition.interpreter_type
                )
            else:
                raise ValueError(f"Invalid input type: {timeseries_evaluation_task.get('input_type', None)}")
        else:
            raise ValueError(f"Invalid evaluation type: {decision_task.get('evaluation_type', None)}")
    elif task_type == PlaybookTaskDefinitionProto.Type.METRIC:
        source = task.get('source', None)
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
        return PlaybookTaskDefinitionProto(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=db_task_definition.type,
            metric_task=metric_task_proto,
            notes=StringValue(value=db_task_definition.notes),
            interpreter_type=db_task_definition.interpreter_type
        )
    elif task_type == PlaybookTaskDefinitionProto.Type.DATA_FETCH:
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
        return PlaybookTaskDefinitionProto(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=db_task_definition.type,
            data_fetch_task=data_fetch_task_proto,
            notes=StringValue(value=db_task_definition.notes),
            interpreter_type=db_task_definition.interpreter_type
        )
    elif task_type == PlaybookTaskDefinitionProto.Type.DOCUMENTATION:
        documentation_task_proto = dict_to_proto(db_task_definition.task, PlaybookDocumentationTaskDefinitionProto)
        return PlaybookTaskDefinitionProto(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=db_task_definition.type,
            documentation_task=documentation_task_proto,
            notes=StringValue(value=db_task_definition.notes),
            interpreter_type=db_task_definition.interpreter_type
        )
    elif task_type == PlaybookTaskDefinitionProto.Type.ACTION:
        source = task.get('source', None)
        if source == 'API':
            action_task_proto = get_api_call_task_execution_proto(task)
        else:
            raise ValueError(f"Invalid source: {source}")
        return PlaybookTaskDefinitionProto(
            id=UInt64Value(value=db_task_definition.id),
            name=StringValue(value=db_task_definition.name),
            description=StringValue(value=db_task_definition.description),
            type=db_task_definition.type,
            action_task=action_task_proto,
            notes=StringValue(value=db_task_definition.notes),
            interpreter_type=db_task_definition.interpreter_type
        )
    else:
        raise ValueError(f"Invalid type: {task_type}")
