from datetime import timezone
from hashlib import md5
from django.db import models
from google.protobuf.struct_pb2 import Struct
from google.protobuf.wrappers_pb2 import StringValue, BoolValue, UInt64Value

from executor.utils.playbooks_protos_utils import get_playbook_task_definition_proto
from protos.base_pb2 import TimeRange
from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType, Interpretation as InterpretationProto
from protos.playbooks.playbook_pb2 import Playbook as PlaybookProto, \
    PlaybookStepDefinition as PlaybookStepDefinitionProto, PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    PlaybookExecutionStatusType, PlaybookExecutionLog as PlaybookExecutionLogProto, \
    PlaybookExecution as PlaybookExecutionProto, PlaybookTaskExecutionResult as PlaybookTaskExecutionResultProto, \
    PlaybookStepExecutionLog as PlaybookStepExecutionLogProto
from utils.model_utils import generate_choices

from accounts.models import Account
from utils.proto_utils import dict_to_proto


class PlayBookTaskDefinition(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)

    name = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    notes = models.TextField(null=True, blank=True)

    type = models.IntegerField(choices=generate_choices(PlaybookTaskDefinitionProto.Type), db_index=True)
    task = models.JSONField()
    task_md5 = models.CharField(max_length=256, db_index=True)

    created_by = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        unique_together = [['account', 'name', 'task_md5', 'created_by']]

    @property
    def proto(self) -> PlaybookTaskDefinitionProto:
        return get_playbook_task_definition_proto(self)

    @property
    def proto_partial(self) -> PlaybookTaskDefinitionProto:
        return PlaybookTaskDefinitionProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            description=StringValue(value=self.description),
            type=self.type,
            notes=StringValue(value=self.notes)
        )

    def save(self, **kwargs):
        if self.task:
            self.task_md5 = md5(str(self.task).encode('utf-8')).hexdigest()
        super().save(**kwargs)


class PlayBookStep(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)

    name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    description = models.CharField(max_length=255, db_index=True)
    notes = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    interpreter_type = models.IntegerField(choices=generate_choices(InterpreterType), db_index=True,
                                           default=InterpreterType.BASIC_I)

    tasks = models.ManyToManyField(PlayBookTaskDefinition, through='PlayBookStepTaskDefinitionMapping',
                                   related_name='step_tasks')

    created_by = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    @property
    def proto(self) -> PlaybookStepDefinitionProto:
        all_tasks = self.tasks.all().order_by('playbooksteptaskdefinitionmapping__id')
        tasks = [pbt.proto for pbt in all_tasks]

        metadata = self.metadata if self.metadata else {}
        el_list_proto: [PlaybookStepDefinitionProto.ExternalLink] = []
        if 'external_links' in metadata:
            for el in metadata['external_links']:
                el_list_proto.append(PlaybookStepDefinitionProto.ExternalLink(
                    name=StringValue(value=el['name']),
                    url=StringValue(value=el['url'])
                ))

        return PlaybookStepDefinitionProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            external_links=el_list_proto,
            description=StringValue(value=self.description),
            notes=StringValue(value=self.notes),
            interpreter_type=self.interpreter_type,
            tasks=tasks
        )

    @property
    def proto_partial(self) -> PlaybookStepDefinitionProto:
        metadata = self.metadata if self.metadata else {}
        el_list_proto: [PlaybookStepDefinitionProto.ExternalLink] = []
        if 'external_links' in metadata:
            for el in metadata['external_links']:
                el_list_proto.append(PlaybookStepDefinitionProto.ExternalLink(
                    name=StringValue(value=el['name']),
                    url=StringValue(value=el['url'])
                ))
        return PlaybookStepDefinitionProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            external_links=el_list_proto,
            description=StringValue(value=self.description),
            notes=StringValue(value=self.notes),
            interpreter_type=self.interpreter_type
        )


class PlayBook(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)

    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, null=True, blank=True)
    global_variable_set = models.JSONField(null=True, blank=True)

    steps = models.ManyToManyField(PlayBookStep, through='PlayBookStepMapping', related_name='playbook_steps')

    is_active = models.BooleanField(default=True)
    created_by = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        unique_together = [['account', 'name', 'created_by']]

    @property
    def proto(self) -> PlaybookProto:
        all_steps = self.steps.all().order_by('playbookstepmapping__id')
        if self.is_active:
            all_steps = all_steps.filter(playbookstepmapping__is_active=True)
        steps = [pbs.proto for pbs in all_steps]

        global_variable_set_proto = Struct()
        if self.global_variable_set:
            global_variable_set_proto.update(self.global_variable_set)

        return PlaybookProto(
            id=UInt64Value(value=self.id), name=StringValue(value=self.name), is_active=BoolValue(value=self.is_active),
            description=StringValue(value=self.description),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            global_variable_set=global_variable_set_proto,
            steps=steps,
        )

    @property
    def proto_partial(self) -> PlaybookProto:
        global_variable_set_proto = Struct()
        if self.global_variable_set:
            global_variable_set_proto.update(self.global_variable_set)
        return PlaybookProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            is_active=BoolValue(value=self.is_active),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            global_variable_set=global_variable_set_proto
        )


class PlayBookStepTaskDefinitionMapping(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    playbook_task_definition = models.ForeignKey(PlayBookTaskDefinition, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, null=True, blank=True)


class PlayBookStepMapping(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, null=True, blank=True)


class PlayBookExecution(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE)
    playbook_run_id = models.CharField(max_length=255)
    status = models.IntegerField(null=True, blank=True, choices=generate_choices(PlaybookExecutionStatusType),
                                 default=PlaybookExecutionStatusType.CREATED, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    started_at = models.DateTimeField(blank=True, null=True, db_index=True)
    finished_at = models.DateTimeField(blank=True, null=True, db_index=True)
    time_range = models.JSONField(null=True, blank=True)

    created_by = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = [['account', 'playbook_run_id']]

    @property
    def proto(self) -> PlaybookExecutionProto:
        playbook_step_execution_logs = self.playbookstepexecutionlog_set.all()
        if not playbook_step_execution_logs:
            playbook_execution_logs = self.playbookexecutionlog_set.all()
            logs = [pel.proto for pel in playbook_execution_logs]
            step_execution_logs: [PlaybookStepExecutionLogProto] = []
            step_task_executions_map = {}
            step_definition_map = {}
            for log in logs:
                if log.step.id.value not in step_definition_map:
                    step_definition_map[log.step.id.value] = log.step
                if log.step.id.value not in step_task_executions_map:
                    step_task_executions_map[log.step.id.value] = []
                execution_logs = step_task_executions_map[log.step.id.value]
                execution_logs.append(log)
                step_task_executions_map[log.step.id.value] = execution_logs
            for step_id, logs in step_task_executions_map.items():
                step = step_definition_map[step_id]
                step_execution_logs.append(PlaybookStepExecutionLogProto(
                    step=step,
                    logs=logs
                ))
        else:
            step_execution_logs = [pel.proto for pel in playbook_step_execution_logs]
        time_range_proto = dict_to_proto(self.time_range, TimeRange) if self.time_range else TimeRange()
        return PlaybookExecutionProto(
            id=UInt64Value(value=self.id),
            playbook_run_id=StringValue(value=self.playbook_run_id),
            playbook=self.playbook.proto_partial,
            status=self.status,
            started_at=int(self.started_at.replace(tzinfo=timezone.utc).timestamp()) if self.started_at else 0,
            finished_at=int(self.finished_at.replace(tzinfo=timezone.utc).timestamp()) if self.finished_at else 0,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            time_range=time_range_proto,
            step_execution_logs=step_execution_logs
        )

    @property
    def proto_partial(self) -> PlaybookExecutionProto:
        time_range_proto = dict_to_proto(self.time_range, TimeRange) if self.time_range else TimeRange()
        return PlaybookExecutionProto(
            id=UInt64Value(value=self.id),
            playbook_run_id=StringValue(value=self.playbook_run_id),
            playbook=self.playbook.proto_partial,
            status=self.status,
            started_at=int(self.started_at.replace(tzinfo=timezone.utc).timestamp()) if self.started_at else 0,
            finished_at=int(self.finished_at.replace(tzinfo=timezone.utc).timestamp()) if self.finished_at else 0,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            time_range=time_range_proto,
        )


class PlayBookStepExecutionLog(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_execution = models.ForeignKey(PlayBookExecution, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    interpretation = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    @property
    def proto(self) -> PlaybookStepExecutionLogProto:
        logs = self.playbookexecutionlog_set.all()
        log_protos = [pel.proto for pel in logs]
        step = self.playbook_step.proto_partial
        return PlaybookStepExecutionLogProto(
            id=UInt64Value(value=self.id),
            timestamp=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            step=step,
            logs=log_protos,
            step_interpretation=dict_to_proto(self.interpretation,
                                              InterpretationProto) if self.interpretation else InterpretationProto()
        )

    @property
    def proto_partial(self) -> PlaybookStepExecutionLogProto:
        step = self.playbook_step.proto_partial
        return PlaybookStepExecutionLogProto(
            id=UInt64Value(value=self.id),
            timestamp=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            step=step,
            step_interpretation=dict_to_proto(self.interpretation,
                                              InterpretationProto) if self.interpretation else InterpretationProto()
        )


class PlayBookExecutionLog(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_execution = models.ForeignKey(PlayBookExecution, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    playbook_task_definition = models.ForeignKey(PlayBookTaskDefinition, on_delete=models.CASCADE, db_index=True)
    playbook_step_execution_log = models.ForeignKey(PlayBookStepExecutionLog, on_delete=models.CASCADE, db_index=True,
                                                    null=True, blank=True)

    playbook_task_result = models.JSONField()
    interpretation = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    @property
    def proto(self) -> PlaybookExecutionLogProto:
        task = self.playbook_task_definition.proto
        return PlaybookExecutionLogProto(
            id=UInt64Value(value=self.id),
            timestamp=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            task=task,
            task_execution_result=dict_to_proto(self.playbook_task_result, PlaybookTaskExecutionResultProto),
            task_interpretation=dict_to_proto(self.interpretation,
                                              InterpretationProto) if self.interpretation else InterpretationProto()
        )
