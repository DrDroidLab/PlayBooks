from datetime import timezone
from hashlib import md5

from django.db import models
from google.protobuf.struct_pb2 import Struct
from google.protobuf.wrappers_pb2 import StringValue, BoolValue, UInt64Value

from connectors.models import Connector
from executor.utils.old_to_new_model_transformers import transform_PlaybookTaskResult_to_PlaybookTaskExecutionResult
from executor.utils.deprecated_playbooks_protos_utils import get_playbook_task_definition_proto
from playbooks.utils.decorators import deprecated
from protos.base_pb2 import TimeRange
from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType, Interpretation as InterpretationProto
from protos.playbooks.playbook_commons_pb2 import PlaybookExecutionStatusType, \
    PlaybookTaskResult as PlaybookTaskResultProto, ExternalLink
from protos.playbooks.deprecated_playbook_pb2 import DeprecatedPlaybook, DeprecatedPlaybookStepDefinition, \
    DeprecatedPlaybookTaskDefinition, DeprecatedPlaybookExecutionLog, DeprecatedPlaybookExecution, \
    DeprecatedPlaybookStepExecutionLog
from protos.playbooks.playbook_pb2 import PlaybookTask as PlaybookTaskProto, PlaybookStep as PlaybookStepProto, \
    Playbook as PlaybookProto, PlaybookTaskExecutionLog as PlaybookTaskExecutionLogProto, \
    PlaybookStepExecutionLog as PlaybookStepExecutionLogProto, PlaybookExecution as PlaybookExecutionProto, \
    PlaybookStepRelation as PlaybookStepRelationProto, \
    PlaybookStepRelationExecutionLog as PlaybookStepRelationExecutionLogProto, PlaybookStepResultCondition
from utils.model_utils import generate_choices

from accounts.models import Account
from utils.proto_utils import dict_to_proto


class PlayBookTask(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)

    name = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    notes = models.TextField(null=True, blank=True)

    task = models.JSONField()
    task_md5 = models.CharField(max_length=256, db_index=True)

    created_by = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    task_connector_source = models.ManyToManyField(Connector, through='PlayBookStepTaskConnectorMapping',
                                                   related_name='task_source')

    class Meta:
        unique_together = [['account', 'name', 'task_md5', 'created_by']]

    @property
    def proto(self) -> PlaybookTaskProto:
        playbook_task = dict_to_proto(self.task, PlaybookTaskProto)
        playbook_task.id.value = self.id
        playbook_task.name.value = self.name
        playbook_task.description.value = self.description
        playbook_task.notes.value = self.notes
        playbook_task.created_by.value = self.created_by if self.created_by else ''
        return playbook_task

    def proto_with_connector_source(self, playbook_id, playbook_step_id) -> PlaybookTaskProto:
        playbook_task = dict_to_proto(self.task, PlaybookTaskProto)
        playbook_task.id.value = self.id
        playbook_task.name.value = self.name
        playbook_task.description.value = self.description
        playbook_task.notes.value = self.notes
        playbook_task.created_by.value = self.created_by if self.created_by else ''
        all_playbook_step_task_connectors = PlayBookStepTaskConnectorMapping.objects.filter(
            account=self.account, playbook_id=playbook_id, playbook_step_id=playbook_step_id, playbook_task=self,
            is_active=True
        )
        all_playbook_step_task_connectors = all_playbook_step_task_connectors.select_related('connector')
        all_playbook_step_task_connectors = all_playbook_step_task_connectors.values('connector_id',
                                                                                     'connector__name',
                                                                                     'connector__connector_type')
        connector_source: [PlaybookTaskProto.PlaybookTaskConnectorSource] = []
        for connector in all_playbook_step_task_connectors:
            connector_source.append(
                PlaybookTaskProto.PlaybookTaskConnectorSource(id=UInt64Value(value=connector['connector_id']),
                                                              source=connector['connector__connector_type'],
                                                              name=StringValue(
                                                                  value=connector['connector__name'])))
        playbook_task.task_connector_sources.extend(connector_source)
        return playbook_task

    @property
    def proto_partial(self) -> PlaybookTaskProto:
        return PlaybookTaskProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            description=StringValue(value=self.description),
            notes=StringValue(value=self.notes),
            created_by=StringValue(value=self.created_by)
        )

    @property
    @deprecated
    def deprecated_proto(self) -> DeprecatedPlaybookTaskDefinition:
        return get_playbook_task_definition_proto(self)


class PlayBookStep(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    description = models.CharField(max_length=255, db_index=True)
    notes = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    interpreter_type = models.IntegerField(choices=generate_choices(InterpreterType), db_index=True,
                                           default=InterpreterType.BASIC_I)

    tasks = models.ManyToManyField(PlayBookTask, through='PlayBookStepTaskDefinitionMapping',
                                   related_name='step_tasks')

    created_by = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    @property
    def proto(self) -> PlaybookStepProto:
        all_tasks = self.tasks.all().order_by('playbooksteptaskdefinitionmapping__id')
        tasks = [pbt.proto for pbt in all_tasks]

        metadata = self.metadata if self.metadata else {}
        el_list_proto: [ExternalLink] = []
        if 'external_links' in metadata:
            for el in metadata['external_links']:
                el_list_proto.append(ExternalLink(
                    name=StringValue(value=el['name']),
                    url=StringValue(value=el['url'])
                ))

        return PlaybookStepProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            external_links=el_list_proto,
            description=StringValue(value=self.description),
            notes=StringValue(value=self.notes),
            interpreter_type=self.interpreter_type,
            tasks=tasks
        )

    @property
    def proto_partial(self) -> PlaybookStepProto:
        metadata = self.metadata if self.metadata else {}
        el_list_proto: [ExternalLink] = []
        if 'external_links' in metadata:
            for el in metadata['external_links']:
                el_list_proto.append(ExternalLink(
                    name=StringValue(value=el['name']),
                    url=StringValue(value=el['url'])
                ))
        return PlaybookStepProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            external_links=el_list_proto,
            description=StringValue(value=self.description),
            notes=StringValue(value=self.notes),
            interpreter_type=self.interpreter_type
        )

    @property
    @deprecated
    def deprecated_proto(self) -> DeprecatedPlaybookStepDefinition:
        all_tasks = self.tasks.all().order_by('playbooksteptaskdefinitionmapping__id')
        tasks = [pbt.deprecated_proto for pbt in all_tasks]

        metadata = self.metadata if self.metadata else {}
        el_list_proto: [ExternalLink] = []
        if 'external_links' in metadata:
            for el in metadata['external_links']:
                el_list_proto.append(ExternalLink(name=StringValue(value=el['name']), url=StringValue(value=el['url'])))

        return DeprecatedPlaybookStepDefinition(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            external_links=el_list_proto,
            description=StringValue(value=self.description),
            notes=StringValue(value=self.notes),
            interpreter_type=self.interpreter_type,
            tasks=tasks
        )

    @property
    @deprecated
    def deprecated_proto_partial(self) -> DeprecatedPlaybookStepDefinition:
        metadata = self.metadata if self.metadata else {}
        el_list_proto: [ExternalLink] = []
        if 'external_links' in metadata:
            for el in metadata['external_links']:
                el_list_proto.append(ExternalLink(
                    name=StringValue(value=el['name']),
                    url=StringValue(value=el['url'])
                ))
        return DeprecatedPlaybookStepDefinition(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            external_links=el_list_proto,
            description=StringValue(value=self.description),
            notes=StringValue(value=self.notes),
            interpreter_type=self.interpreter_type
        )

    def playbook_specific_proto(self, playbook_id) -> PlaybookStepProto:
        all_tasks = self.tasks.all().order_by('playbooksteptaskdefinitionmapping__id')
        tasks = [pbt.proto for pbt in all_tasks]

        all_active_relations = PlayBookStepRelation.objects.filter(account=self.account, playbook_id=playbook_id,
                                                                   parent=self, is_active=True)

        all_active_relations_protos = [aar.child_specific_proto for aar in all_active_relations]

        metadata = self.metadata if self.metadata else {}
        el_list_proto: [ExternalLink] = []
        if 'external_links' in metadata:
            for el in metadata['external_links']:
                el_list_proto.append(ExternalLink(
                    name=StringValue(value=el['name']),
                    url=StringValue(value=el['url'])
                ))

        return PlaybookStepProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            external_links=el_list_proto,
            description=StringValue(value=self.description),
            notes=StringValue(value=self.notes),
            interpreter_type=self.interpreter_type,
            tasks=tasks,
            children=all_active_relations_protos
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
        steps = [pbs.playbook_specific_proto(self.id) for pbs in all_steps]
        all_step_relations = []
        for st in steps:
            all_active_relations = PlayBookStepRelation.objects.filter(account=self.account, playbook=self,
                                                                       parent_id=st.id.value, is_active=True)
            all_active_relations_protos = [aar.proto for aar in all_active_relations]
            all_step_relations.extend(all_active_relations_protos)
            for t in st.tasks:
                all_playbook_step_task_connectors = PlayBookStepTaskConnectorMapping.objects.filter(
                    account=self.account, playbook=self, playbook_step_id=st.id.value, playbook_task_id=t.id.value,
                    is_active=True
                )
                all_playbook_step_task_connectors = all_playbook_step_task_connectors.select_related('connector')
                all_playbook_step_task_connectors = all_playbook_step_task_connectors.values('connector_id',
                                                                                             'connector__name',
                                                                                             'connector__connector_type')
                connector_source: [PlaybookTaskProto.PlaybookTaskConnectorSource] = []
                for connector in all_playbook_step_task_connectors:
                    connector_source.append(
                        PlaybookTaskProto.PlaybookTaskConnectorSource(id=UInt64Value(value=connector['connector_id']),
                                                                      source=connector['connector__connector_type'],
                                                                      name=StringValue(
                                                                          value=connector['connector__name'])))
                t.task_connector_sources.extend(connector_source)

        global_variable_set_proto = Struct()
        if self.global_variable_set:
            global_variable_set_proto.update(self.global_variable_set)

        return PlaybookProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            is_active=BoolValue(value=self.is_active),
            description=StringValue(value=self.description),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            global_variable_set=global_variable_set_proto,
            steps=steps,
            step_relations=all_step_relations
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

    @property
    @deprecated
    def deprecated_proto(self) -> DeprecatedPlaybook:
        all_steps = self.steps.all().order_by('playbookstepmapping__id')
        if self.is_active:
            all_steps = all_steps.filter(playbookstepmapping__is_active=True)
        steps = [pbs.deprecated_proto for pbs in all_steps]

        global_variable_set_proto = Struct()
        if self.global_variable_set:
            global_variable_set_proto.update(self.global_variable_set)

        return DeprecatedPlaybook(
            id=UInt64Value(value=self.id), name=StringValue(value=self.name), is_active=BoolValue(value=self.is_active),
            description=StringValue(value=self.description),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            global_variable_set=global_variable_set_proto,
            steps=steps,
        )

    @property
    @deprecated
    def deprecated_proto_partial(self) -> DeprecatedPlaybook:
        global_variable_set_proto = Struct()
        if self.global_variable_set:
            global_variable_set_proto.update(self.global_variable_set)
        return DeprecatedPlaybook(
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
    playbook_task_definition = models.ForeignKey(PlayBookTask, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, null=True, blank=True)


class PlayBookStepMapping(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, null=True, blank=True)


class PlayBookStepTaskConnectorMapping(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    playbook_task = models.ForeignKey(PlayBookTask, on_delete=models.CASCADE, db_index=True)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, null=True, blank=True)

    class Meta:
        unique_together = [['account', 'playbook', 'playbook_step', 'playbook_task', 'connector']]


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
    execution_global_variable_set = models.JSONField(null=True, blank=True)

    class Meta:
        unique_together = [['account', 'playbook_run_id']]

    @property
    def proto_partial(self) -> PlaybookExecutionProto:
        time_range_proto = dict_to_proto(self.time_range, TimeRange) if self.time_range else TimeRange()

        return PlaybookExecutionProto(
            id=UInt64Value(value=self.id),
            playbook_run_id=StringValue(value=self.playbook_run_id),
            playbook=self.playbook.proto,
            status=self.status,
            started_at=int(self.started_at.replace(tzinfo=timezone.utc).timestamp()) if self.started_at else 0,
            finished_at=int(self.finished_at.replace(tzinfo=timezone.utc).timestamp()) if self.finished_at else 0,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            time_range=time_range_proto,
        )

    @property
    def proto(self) -> PlaybookExecutionProto:
        playbook_step_execution_logs = self.playbookstepexecutionlog_set.all()
        if not playbook_step_execution_logs:
            playbook_execution_logs = self.playbooktaskexecutionlog_set.all()
            step_execution_logs: [PlaybookStepExecutionLogProto] = []
            step_task_executions_map = {}
            step_definition_map = {}
            for log in playbook_execution_logs:
                if log.playbook_step.id not in step_definition_map:
                    step_definition_map[log.playbook_step.id] = log.playbook_step.proto_partial
                if log.playbook_step.id not in step_task_executions_map:
                    step_task_executions_map[log.playbook_step.id] = []
                execution_logs = step_task_executions_map[log.playbook_step.id]
                execution_logs.append(log.proto)
                step_task_executions_map[log.playbook_step.id] = execution_logs
            for step_id, logs in step_task_executions_map.items():
                step = step_definition_map[step_id]
                step_execution_logs.append(PlaybookStepExecutionLogProto(
                    step=step,
                    task_execution_logs=logs
                ))
        else:
            playbook_step_execution_logs = playbook_step_execution_logs.order_by('id')
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
    @deprecated
    def deprecated_proto(self) -> DeprecatedPlaybookExecution:
        playbook_step_execution_logs = self.playbookstepexecutionlog_set.all()
        if not playbook_step_execution_logs:
            playbook_execution_logs = self.playbooktaskexecutionlog_set.all()
            logs = [pel.deprecated_proto for pel in playbook_execution_logs]
            step_execution_logs: [DeprecatedPlaybookStepExecutionLog] = []
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
                step_execution_logs.append(DeprecatedPlaybookStepExecutionLog(
                    step=step,
                    logs=logs
                ))
        else:
            step_execution_logs = [pel.deprecated_proto for pel in playbook_step_execution_logs]
        time_range_proto = dict_to_proto(self.time_range, TimeRange) if self.time_range else TimeRange()
        return DeprecatedPlaybookExecution(
            id=UInt64Value(value=self.id),
            playbook_run_id=StringValue(value=self.playbook_run_id),
            playbook=self.playbook.deprecated_proto_partial,
            status=self.status,
            started_at=int(self.started_at.replace(tzinfo=timezone.utc).timestamp()) if self.started_at else 0,
            finished_at=int(self.finished_at.replace(tzinfo=timezone.utc).timestamp()) if self.finished_at else 0,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            time_range=time_range_proto,
            step_execution_logs=step_execution_logs
        )


class PlayBookStepExecutionLog(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_execution = models.ForeignKey(PlayBookExecution, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    interpretation = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_by = models.TextField(null=True, blank=True)
    time_range = models.JSONField(null=True, blank=True)

    @property
    def proto(self) -> PlaybookStepExecutionLogProto:
        time_range_proto = dict_to_proto(self.time_range, TimeRange) if self.time_range else TimeRange()
        logs = self.playbooktaskexecutionlog_set.all()
        logs = logs.order_by('id')
        task_execution_logs = [pel.proto for pel in logs]
        relation_execution_logs = self.playbooksteprelationexecutionlog_set.all()
        relation_execution_log_protos = [rel.proto for rel in relation_execution_logs]
        step = self.playbook_step.proto_partial
        return PlaybookStepExecutionLogProto(
            id=UInt64Value(value=self.id),
            timestamp=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            step=step,
            task_execution_logs=task_execution_logs,
            relation_execution_logs=relation_execution_log_protos,
            step_interpretation=dict_to_proto(self.interpretation,
                                              InterpretationProto) if self.interpretation else InterpretationProto(),
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            time_range=time_range_proto
        )

    @property
    @deprecated
    def deprecated_proto(self) -> DeprecatedPlaybookStepExecutionLog:
        logs = self.playbooktaskexecutionlog_set.all()
        log_protos = [pel.deprecated_proto for pel in logs]
        step = self.playbook_step.deprecated_proto_partial
        return DeprecatedPlaybookStepExecutionLog(
            id=UInt64Value(value=self.id),
            timestamp=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            step=step,
            logs=log_protos,
            step_interpretation=dict_to_proto(self.interpretation,
                                              InterpretationProto) if self.interpretation else InterpretationProto()
        )


class PlayBookTaskExecutionLog(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_execution = models.ForeignKey(PlayBookExecution, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    playbook_task_definition = models.ForeignKey(PlayBookTask, on_delete=models.CASCADE, db_index=True)
    playbook_step_execution_log = models.ForeignKey(PlayBookStepExecutionLog, on_delete=models.CASCADE, db_index=True,
                                                    null=True, blank=True)
    playbook_task_result = models.JSONField()
    interpretation = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_by = models.TextField(null=True, blank=True)
    time_range = models.JSONField(null=True, blank=True)

    @property
    def proto(self) -> PlaybookTaskExecutionLogProto:
        task = self.playbook_task_definition.proto_with_connector_source(self.playbook.id, self.playbook_step.id)
        time_range_proto = dict_to_proto(self.time_range, TimeRange) if self.time_range else TimeRange()
        return PlaybookTaskExecutionLogProto(
            id=UInt64Value(value=self.id),
            timestamp=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            task=task,
            result=dict_to_proto(self.playbook_task_result, PlaybookTaskResultProto),
            interpretation=dict_to_proto(self.interpretation,
                                         InterpretationProto) if self.interpretation else InterpretationProto(),
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            time_range=time_range_proto
        )

    @property
    @deprecated
    def deprecated_proto(self) -> DeprecatedPlaybookExecutionLog:
        task = self.playbook_task_definition.deprecated_proto
        task_result = self.playbook_task_result
        task_result_proto = dict_to_proto(task_result, PlaybookTaskResultProto)
        task_execution_result = transform_PlaybookTaskResult_to_PlaybookTaskExecutionResult(task_result_proto)
        return DeprecatedPlaybookExecutionLog(
            id=UInt64Value(value=self.id),
            timestamp=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            task=task,
            step=self.playbook_step.deprecated_proto_partial,
            task_execution_result=task_execution_result,
            task_interpretation=dict_to_proto(self.interpretation,
                                              InterpretationProto) if self.interpretation else InterpretationProto()
        )


class PlayBookStepRelation(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    parent = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, related_name='parent_step', db_index=True)
    child = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, related_name='child_step', db_index=True)
    condition = models.JSONField(null=True, blank=True)
    condition_md5 = models.CharField(max_length=256, db_index=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [['account', 'playbook', 'parent', 'child', 'condition_md5']]

    def save(self, **kwargs):
        if self.condition:
            self.condition_md5 = md5(str(self.condition).encode('utf-8')).hexdigest()
        super().save(**kwargs)

    @property
    def proto(self) -> PlaybookStepRelationProto:
        return PlaybookStepRelationProto(
            id=UInt64Value(value=self.id),
            parent=self.parent.proto_partial,
            child=self.child.proto_partial,
            condition=dict_to_proto(self.condition,
                                    PlaybookStepResultCondition) if self.condition else PlaybookStepResultCondition(),
            is_active=BoolValue(value=self.is_active)
        )

    @property
    def child_specific_proto(self) -> PlaybookStepRelationProto:
        return PlaybookStepRelationProto(
            id=UInt64Value(value=self.id),
            child=self.child.proto_partial,
            condition=dict_to_proto(self.condition,
                                    PlaybookStepResultCondition) if self.condition else PlaybookStepResultCondition(),
            is_active=BoolValue(value=self.is_active)
        )


class PlayBookStepRelationExecutionLog(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_step_relation = models.ForeignKey(PlayBookStepRelation, on_delete=models.CASCADE, db_index=True)
    playbook_execution = models.ForeignKey(PlayBookExecution, on_delete=models.CASCADE, db_index=True)
    playbook_step_execution_log = models.ForeignKey(PlayBookStepExecutionLog, on_delete=models.CASCADE, db_index=True)
    evaluation_result = models.BooleanField()
    interpretation = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    evaluation_output = models.JSONField(null=True, blank=True)

    @property
    def proto(self) -> PlaybookStepRelationExecutionLogProto:
        evaluation_output_proto = dict_to_proto(self.evaluation_output, Struct) if self.evaluation_output else Struct()
        return PlaybookStepRelationExecutionLogProto(
            id=UInt64Value(value=self.id),
            relation=self.playbook_step_relation.proto,
            evaluation_result=BoolValue(value=self.evaluation_result),
            evaluation_output=evaluation_output_proto,
            step_relation_interpretation=dict_to_proto(self.interpretation,
                                        InterpretationProto) if self.interpretation else InterpretationProto(),

        )
