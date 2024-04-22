from datetime import timezone
from hashlib import md5

from django.db import models
from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, BoolValue

from accounts.models import Account
from executor.models import PlayBook
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint as WorkflowEntryPointProto, \
    WorkflowAction as WorkflowActionProto, WorkflowSchedule as WorkflowScheduleProto, Workflow as WorkflowProto
from utils.model_utils import generate_choices
from utils.proto_utils import dict_to_proto


class WorkflowEntryPoint(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    type = models.IntegerField(choices=generate_choices(WorkflowEntryPointProto.Type), db_index=True)
    entry_point = models.JSONField()
    entry_point_md5 = models.CharField(max_length=256, db_index=True)
    is_active = models.BooleanField(default=True)
    created_by = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = [['account', 'type', 'entry_point_md5', 'created_by']]

    def save(self, **kwargs):
        if self.entry_point:
            self.entry_point_md5 = md5(str(self.entry_point).encode('utf-8')).hexdigest()
        super().save(**kwargs)

    @property
    def proto(self) -> WorkflowEntryPointProto:
        ep_proto = dict_to_proto(self.entry_point, WorkflowEntryPointProto)
        if ep_proto.type == WorkflowEntryPointProto.Type.API:
            return WorkflowEntryPointProto(
                id=UInt64Value(value=self.id),
                type=ep_proto.type,
                api_config=ep_proto.api_config
            )
        elif ep_proto.type == WorkflowEntryPointProto.Type.ALERT:
            return WorkflowEntryPointProto(
                id=UInt64Value(value=self.id),
                type=ep_proto.type,
                alert_config=ep_proto.alert_config
            )
        else:
            raise ValueError(f"Invalid entry point type: {ep_proto.type}")


class WorkflowAction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    type = models.IntegerField(choices=generate_choices(WorkflowActionProto.Type), db_index=True)
    action = models.JSONField()
    action_md5 = models.CharField(max_length=256, db_index=True)
    is_active = models.BooleanField(default=True)
    created_by = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = [['account', 'type', 'action_md5', 'created_by']]

    def save(self, **kwargs):
        if self.action_md5:
            self.action_md5_md5 = md5(str(self.action).encode('utf-8')).hexdigest()
        super().save(**kwargs)

    @property
    def proto(self) -> WorkflowActionProto:
        wf_action_proto = dict_to_proto(self.action, WorkflowActionProto)
        if wf_action_proto.type == WorkflowActionProto.Type.NOTIFY:
            return WorkflowActionProto(
                id=UInt64Value(value=self.id),
                type=wf_action_proto.type,
                notify=wf_action_proto.notify
            )
        else:
            raise ValueError(f"Invalid action type: {wf_action_proto.type}")


class Workflow(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    created_by = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    schedule_type = models.IntegerField(choices=generate_choices(WorkflowScheduleProto.Type), db_index=True)
    schedule = models.JSONField()

    playbooks = models.ManyToManyField(
        PlayBook,
        through='WorkflowPlayBookMapping',
        related_name='workflow_playbooks'
    )

    entry_points = models.ManyToManyField(
        WorkflowEntryPoint,
        through='WorkflowEntryPointMapping',
        related_name='workflow_entry_points'
    )

    actions = models.ManyToManyField(
        WorkflowAction,
        through='WorkflowActionMapping',
        related_name='workflow_actions'
    )

    class Meta:
        unique_together = [['account', 'name', 'created_by']]

    def save(self, **kwargs):
        if self.schedule:
            self.schedule_md5 = md5(str(self.schedule).encode('utf-8')).hexdigest()
        super().save(**kwargs)

    @property
    def proto(self) -> WorkflowProto:
        all_pbs = self.playbooks.filter(is_active=True)
        all_ob_protos = [pb.proto_partial for pb in all_pbs]

        all_eps = self.entry_points.filter(is_active=True)
        all_ep_protos = [ep.proto for ep in all_eps]

        all_actions = self.actions.filter(is_active=True)
        all_action_protos = [action.proto for action in all_actions]

        return WorkflowProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            description=StringValue(value=self.description),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            is_active=BoolValue(value=self.is_active),
            schedule=dict_to_proto(self.schedule, WorkflowScheduleProto),
            playbooks=all_ob_protos,
            entry_points=all_ep_protos,
            actions=all_action_protos
        )

    @property
    def proto_partial(self) -> WorkflowProto:
        return WorkflowProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            description=StringValue(value=self.description),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            is_active=BoolValue(value=self.is_active),
            schedule=dict_to_proto(self.schedule, WorkflowScheduleProto)
        )


class WorkflowPlayBookMapping(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, db_index=True)
    playbook = models.ForeignKey(PlayBook, on_delete=models.CASCADE, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = [['account', 'workflow', 'playbook']]


class WorkflowEntryPointMapping(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, db_index=True)
    entry_point = models.ForeignKey(WorkflowEntryPoint, on_delete=models.CASCADE, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = [['account', 'workflow', 'entry_point']]


class WorkflowActionMapping(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, db_index=True)
    action = models.ForeignKey(WorkflowAction, on_delete=models.CASCADE, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = [['account', 'workflow', 'action']]
