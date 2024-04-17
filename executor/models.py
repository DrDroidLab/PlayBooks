from datetime import timezone
from hashlib import md5
from django.db import models
from google.protobuf.struct_pb2 import Struct
from google.protobuf.wrappers_pb2 import StringValue, BoolValue, UInt64Value

from executor.utils.playbooks_protos_utils import get_playbook_task_definition_proto
from protos.playbooks.playbook_pb2 import Playbook as PlaybookProto, \
    PlaybookStepDefinition as PlaybookStepDefinitionProto, PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    PlaybookExecutionStatusType
from utils.model_utils import generate_choices

from accounts.models import Account


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
        return get_playbook_task_definition_proto(self)

    def save(self, **kwargs):
        if self.task:
            self.task_md5 = md5(str(self.task).encode('utf-8')).hexdigest()
        super().save(**kwargs)


class PlayBookExecution(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE)
    playbook_run_id = models.CharField(max_length=255)
    status = models.IntegerField(null=True, blank=True, choices=generate_choices(PlaybookExecutionStatusType),
                                 default=PlaybookExecutionStatusType.CREATED)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    started_at = models.DateTimeField(blank=True, null=True, db_index=True)
    finished_at = models.DateTimeField(blank=True, null=True, db_index=True)

    class Meta:
        unique_together = [['account', 'playbook_run_id']]


class PlayBookExecutionLog(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    playbook_execution = models.ForeignKey(PlayBookExecution, on_delete=models.CASCADE, db_index=True)
    playbook_step = models.ForeignKey(PlayBookStep, on_delete=models.CASCADE, db_index=True)
    playbook_task_definition = models.ForeignKey(PlayBookTaskDefinition, on_delete=models.CASCADE, db_index=True)
    playbook_task_result_type = models.IntegerField(choices=generate_choices(PlaybookTaskDefinitionProto.Type))
    playbook_task_result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
