from datetime import timezone
from hashlib import md5
from django.db import models
from google.protobuf.struct_pb2 import Struct
from google.protobuf.wrappers_pb2 import StringValue, BoolValue, UInt64Value

from executor.utils.playbooks_protos_utils import get_cloudwatch_task_execution_proto, \
    get_grafana_task_execution_proto, get_new_relic_task_execution_proto, get_datadog_task_execution_proto, \
    get_clickhouse_task_execution_proto, get_postgres_task_execution_proto, get_eks_task_execution_proto
from protos.playbooks.playbook_pb2 import Playbook as PlaybookProto, \
    PlaybookStepDefinition as PlaybookStepDefinitionProto, PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    PlaybookDocumentationTaskDefinition, ElseEvaluationTask, \
    PlaybookDecisionTaskDefinition as PlaybookDecisionTaskDefinitionProto, PlaybookMetricTaskExecutionResult, \
    TimeseriesEvaluationTask
from utils.model_utils import generate_choices

from accounts.models import Account
from utils.proto_utils import dict_to_proto


class PlayBook(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    playbook = models.TextField()

    is_active = models.BooleanField(default=True)
    global_variable_set = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    created_by = models.TextField(null=True, blank=True)
    is_generated = models.BooleanField(default=False)

    class Meta:
        unique_together = [['account', 'name']]

    @property
    def proto(self) -> PlaybookProto:
        playbook_steps = PlayBookStep.objects.filter(playbook=self, is_active=True)
        playbook_steps = playbook_steps.order_by('id')

        steps = []
        for step in playbook_steps:
            steps.append(step.proto)
        global_variable_set_proto = Struct()
        if self.global_variable_set:
            global_variable_set_proto.update(self.global_variable_set)

        return PlaybookProto(
            id=UInt64Value(value=self.id), name=StringValue(value=self.name), is_active=BoolValue(value=self.is_active),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            global_variable_set=global_variable_set_proto,
            steps=steps,
        )

    @property
    def proto_partial(self) -> PlaybookProto:
        return PlaybookProto(
            id=UInt64Value(value=self.id), name=StringValue(value=self.name), is_active=BoolValue(value=self.is_active),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
        )


class PlayBookStep(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)

    name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    description = models.CharField(max_length=255, db_index=True)
    metadata = models.JSONField(null=True, blank=True)

    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    @property
    def proto(self) -> PlaybookProto:
        playbook_step_tasks = PlayBookTaskDefinition.objects.filter(playbook_step=self, is_active=True)
        playbook_step_tasks = playbook_step_tasks.order_by('id')
        tasks = []
        for task in playbook_step_tasks:
            tasks.append(task.proto)
        metadata = self.metadata if self.metadata else {}
        el_list_proto: [PlaybookStepDefinitionProto.ExternalLink] = []
        if 'external_links' in metadata:
            for el in metadata['external_links']:
                el_list_proto.append(PlaybookStepDefinitionProto.ExternalLink(
                    name=StringValue(value=el['name']),
                    url=StringValue(value=el['url'])
                ))
        return PlaybookStepDefinitionProto(
            id=UInt64Value(value=self.id), name=StringValue(value=self.name),
            external_links=el_list_proto,
            description=StringValue(value=self.description), tasks=tasks
        )


class PlayBookTaskDefinition(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)

    name = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    notes = models.TextField(null=True, blank=True)

    type = models.IntegerField(choices=generate_choices(PlaybookTaskDefinitionProto.Type), db_index=True)
    task = models.JSONField()
    task_md5 = models.CharField(max_length=256, db_index=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        unique_together = [['account', 'playbook', 'playbook_step', 'name']]

    @property
    def proto(self) -> PlaybookTaskDefinitionProto:
        task_type = self.type
        task = self.task
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
                    id=UInt64Value(value=self.id), name=StringValue(value=self.name),
                    description=StringValue(value=self.description),
                    type=self.type, decision_task=decision_task_proto, notes=StringValue(value=self.notes)
                )
            elif decision_task.get('evaluation_type', None) == 'TIMESERIES':
                timeseries_evaluation_task = decision_task.get('timeseries_evaluation_task', {})
                if timeseries_evaluation_task.get('input_type', None) == 'METRIC_TIMESERIES':
                    metric_timeseries_input = dict_to_proto(
                        timeseries_evaluation_task.get('metric_timeseries_input', {}),
                        PlaybookMetricTaskExecutionResult)
                    rules_proto = dict_to_proto(decision_task.get('rule', {}), TimeseriesEvaluationTask.Rule)
                    timeseries_evaluation_task_proto = TimeseriesEvaluationTask(
                        input_type=PlaybookTaskDefinitionProto.TimeseriesEvaluationTask.InputType.METRIC_TIMESERIES,
                        rules=rules_proto, metric_timeseries_input=metric_timeseries_input)
                    decision_task_proto = PlaybookDecisionTaskDefinitionProto(
                        evaluation_type=PlaybookTaskDefinitionProto.DecisionTask.EvaluationType.TIMESERIES,
                        timeseries_evaluation_task=timeseries_evaluation_task_proto
                    )
                    return PlaybookTaskDefinitionProto(
                        id=UInt64Value(value=self.id), name=StringValue(value=self.name),
                        description=StringValue(value=self.description), notes=StringValue(value=self.notes),
                        type=self.type, decision_task=decision_task_proto
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
            else:
                raise ValueError(f"Invalid source: {source}")
            return PlaybookTaskDefinitionProto(
                id=UInt64Value(value=self.id),
                name=StringValue(value=self.name),
                description=StringValue(value=self.description),
                type=self.type,
                metric_task=metric_task_proto,
                notes=StringValue(value=self.notes)
            )
        elif task_type == PlaybookTaskDefinitionProto.Type.DATA_FETCH:
            source = task.get('source', None)
            if source == 'CLICKHOUSE':
                data_fetch_task_proto = get_clickhouse_task_execution_proto(task)
            elif source == 'POSTGRES':
                data_fetch_task_proto = get_postgres_task_execution_proto(task)
            elif source == 'EKS':
                data_fetch_task_proto = get_eks_task_execution_proto(task)
            else:
                raise ValueError(f"Invalid source: {source}")
            return PlaybookTaskDefinitionProto(
                id=UInt64Value(value=self.id),
                name=StringValue(value=self.name),
                description=StringValue(value=self.description),
                type=self.type,
                data_fetch_task=data_fetch_task_proto,
                notes=StringValue(value=self.notes)
            )
        elif task_type == PlaybookTaskDefinitionProto.Type.DOCUMENTATION:
            documentation_task_proto = dict_to_proto(self.task, PlaybookDocumentationTaskDefinition)
            return PlaybookTaskDefinitionProto(
                id=UInt64Value(value=self.id),
                name=StringValue(value=self.name),
                description=StringValue(value=self.description),
                type=self.type,
                documentation_task=documentation_task_proto,
                notes=StringValue(value=self.notes)
            )
        else:
            raise ValueError(f"Invalid type: {task_type}")

    def save(self, **kwargs):
        if self.task:
            self.task_md5 = md5(str(self.task).encode('utf-8')).hexdigest()
        super().save(**kwargs)
