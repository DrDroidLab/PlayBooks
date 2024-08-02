from datetime import timezone
from hashlib import md5

from django.db import models
from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, BoolValue

from accounts.models import Account
from executor.models import PlayBook, PlayBookExecution
from protos.base_pb2 import TimeRange
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint as WorkflowEntryPointProto, \
    WorkflowAction as WorkflowActionProto, WorkflowSchedule as WorkflowScheduleProto, Workflow as WorkflowProto, \
    WorkflowExecutionStatusType, WorkflowExecution as WorkflowExecutionProto, \
    WorkflowExecutionLog as WorkflowExecutionLogProto, WorkflowConfiguration as WorkflowConfigurationProto
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

    @property
    def proto(self) -> WorkflowEntryPointProto:
        ep_proto = dict_to_proto(self.entry_point, WorkflowEntryPointProto)
        ep_proto.id.value = self.id
        return ep_proto


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
        if self.action:
            self.action_md5 = md5(str(self.action).encode('utf-8')).hexdigest()
        super().save(**kwargs)

    @property
    def proto(self) -> WorkflowActionProto:
        return dict_to_proto(self.action, WorkflowActionProto)


class Workflow(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    type = models.IntegerField(choices=generate_choices(WorkflowProto.Type), db_index=True)

    is_active = models.BooleanField(default=True)
    created_by = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    schedule_type = models.IntegerField(choices=generate_choices(WorkflowScheduleProto.Type), db_index=True)
    schedule = models.JSONField()
    configuration = models.JSONField(null=True, blank=True)

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
        all_pbs = self.playbooks.filter(workflowplaybookmapping__is_active=True)
        all_ob_protos = [pb.proto_partial for pb in all_pbs]

        all_eps = self.entry_points.filter(workflowentrypointmapping__is_active=True)
        all_ep_protos = [ep.proto for ep in all_eps]

        all_actions = self.actions.filter(workflowactionmapping__is_active=True)
        all_action_protos = [action.proto for action in all_actions]

        latest_workflow_execution = None
        latest_workflow_executions = self.workflowexecution_set.order_by('-created_at')
        if latest_workflow_executions:
            latest_workflow_execution = latest_workflow_executions.first()

        configuration = WorkflowConfigurationProto()
        if self.configuration:
            configuration = dict_to_proto(self.configuration, WorkflowConfigurationProto)
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
            actions=all_action_protos,
            last_execution_time=int(latest_workflow_execution.scheduled_at.replace(
                tzinfo=timezone.utc).timestamp()) if latest_workflow_execution else 0,
            last_execution_status=latest_workflow_execution.status if latest_workflow_execution else WorkflowExecutionStatusType.UNKNOWN_WORKFLOW_STATUS,
            configuration=configuration

        )

    @property
    def proto_partial(self) -> WorkflowProto:
        all_pbs = self.playbooks.filter(workflowplaybookmapping__is_active=True)
        all_ob_protos = [pb.proto_partial for pb in all_pbs]

        latest_workflow_execution = None
        latest_workflow_executions = self.workflowexecution_set.order_by('-created_at')
        if latest_workflow_executions:
            latest_workflow_execution = latest_workflow_executions.first()

        configuration = WorkflowConfigurationProto()
        if self.configuration:
            configuration = dict_to_proto(self.configuration, WorkflowConfigurationProto)
        return WorkflowProto(
            id=UInt64Value(value=self.id),
            name=StringValue(value=self.name),
            description=StringValue(value=self.description),
            created_by=StringValue(value=self.created_by),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            is_active=BoolValue(value=self.is_active),
            playbooks=all_ob_protos,
            schedule=dict_to_proto(self.schedule, WorkflowScheduleProto),
            last_execution_time=int(latest_workflow_execution.scheduled_at.replace(
                tzinfo=timezone.utc).timestamp()) if latest_workflow_execution else 0,
            last_execution_status=latest_workflow_execution.status if latest_workflow_execution else WorkflowExecutionStatusType.UNKNOWN_WORKFLOW_STATUS,
            configuration=configuration
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


#
# class WorkflowActionConnectorMapping(models.Model):
#     account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
#     workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, db_index=True)
#     workflow_action = models.ForeignKey(WorkflowAction, on_delete=models.CASCADE, db_index=True)
#     connector = models.ForeignKey(Connector, on_delete=models.CASCADE, db_index=True)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True, db_index=True, null=True, blank=True)
#
#     class Meta:
#         unique_together = [['account', 'workflow', 'workflow_action', 'connector']]


class WorkflowExecution(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, db_index=True)
    workflow_run_id = models.CharField(max_length=256, db_index=True)
    status = models.IntegerField(choices=generate_choices(WorkflowExecutionStatusType),
                                 default=WorkflowExecutionStatusType.WORKFLOW_SCHEDULED, db_index=True)

    metadata = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    scheduled_at = models.DateTimeField(db_index=True)
    expiry_at = models.DateTimeField(blank=True, null=True, db_index=True)
    keep_alive = models.BooleanField(default=False)

    started_at = models.DateTimeField(blank=True, null=True, db_index=True)
    finished_at = models.DateTimeField(blank=True, null=True, db_index=True)
    latest_scheduled_at = models.DateTimeField(blank=True, null=True, db_index=True)
    total_executions = models.IntegerField(default=0)

    time_range = models.JSONField(null=True, blank=True)
    execution_configuration = models.JSONField(null=True, blank=True)
    created_by = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = [['account', 'workflow_run_id', 'scheduled_at']]

    @property
    def proto_max(self) -> WorkflowExecutionProto:
        execution_configuration = WorkflowConfigurationProto()
        if self.execution_configuration:
            execution_configuration = dict_to_proto(self.execution_configuration, WorkflowConfigurationProto)

        metadata = WorkflowExecutionProto.WorkflowExecutionMetadata()
        if self.metadata:
            metadata = dict_to_proto(self.metadata, WorkflowExecutionProto.WorkflowExecutionMetadata)

        if self.time_range:
            time_range_proto = dict_to_proto(self.time_range, TimeRange)

        workflow_execution_logs = self.workflowexecutionlog_set.all()
        wf_logs = [wel.proto for wel in workflow_execution_logs]
        return WorkflowExecutionProto(
            id=UInt64Value(value=self.id),
            workflow_run_id=StringValue(value=self.workflow_run_id),
            workflow=self.workflow.proto,
            status=self.status,
            scheduled_at=int(self.scheduled_at.replace(tzinfo=timezone.utc).timestamp()),
            expiry_at=int(self.expiry_at.replace(tzinfo=timezone.utc).timestamp()) if self.expiry_at else 0,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            started_at=int(self.started_at.replace(tzinfo=timezone.utc).timestamp()) if self.started_at else 0,
            finished_at=int(self.finished_at.replace(tzinfo=timezone.utc).timestamp()) if self.finished_at else 0,
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            workflow_logs=wf_logs,
            execution_configuration=execution_configuration,
            metadata=metadata,
            time_range=time_range_proto,
            keep_alive=BoolValue(value=self.keep_alive) if self.keep_alive else BoolValue(value=False),
            latest_scheduled_at=int(
                self.latest_scheduled_at.replace(tzinfo=timezone.utc).timestamp()) if self.latest_scheduled_at else 0,
            total_executions=UInt64Value(value=self.total_executions)

        )

    @property
    def proto(self) -> WorkflowExecutionProto:
        execution_configuration = WorkflowConfigurationProto()
        if self.execution_configuration:
            execution_configuration = dict_to_proto(self.execution_configuration, WorkflowConfigurationProto)

        metadata = WorkflowExecutionProto.WorkflowExecutionMetadata()
        if self.metadata:
            metadata = dict_to_proto(self.metadata, WorkflowExecutionProto.WorkflowExecutionMetadata)

        if self.time_range:
            time_range_proto = dict_to_proto(self.time_range, TimeRange)

        workflow_execution_logs = self.workflowexecutionlog_set.all()
        wf_logs = [wel.proto for wel in workflow_execution_logs]
        return WorkflowExecutionProto(
            id=UInt64Value(value=self.id),
            workflow_run_id=StringValue(value=self.workflow_run_id),
            workflow=self.workflow.proto_partial,
            status=self.status,
            scheduled_at=int(self.scheduled_at.replace(tzinfo=timezone.utc).timestamp()),
            expiry_at=int(self.expiry_at.replace(tzinfo=timezone.utc).timestamp()) if self.expiry_at else 0,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            started_at=int(self.started_at.replace(tzinfo=timezone.utc).timestamp()) if self.started_at else 0,
            finished_at=int(self.finished_at.replace(tzinfo=timezone.utc).timestamp()) if self.finished_at else 0,
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            workflow_logs=wf_logs,
            execution_configuration=execution_configuration,
            metadata=metadata,
            time_range=time_range_proto,
            keep_alive=BoolValue(value=self.keep_alive) if self.keep_alive else BoolValue(value=False),
            latest_scheduled_at=int(
                self.latest_scheduled_at.replace(tzinfo=timezone.utc).timestamp()) if self.latest_scheduled_at else 0,
            total_executions=UInt64Value(value=self.total_executions)
        )

    @property
    def proto_partial(self) -> WorkflowExecutionProto:
        execution_configuration = WorkflowConfigurationProto()
        if self.execution_configuration:
            execution_configuration = dict_to_proto(self.execution_configuration, WorkflowConfigurationProto)

        metadata = WorkflowExecutionProto.WorkflowExecutionMetadata()
        if self.metadata:
            metadata = dict_to_proto(self.metadata, WorkflowExecutionProto.WorkflowExecutionMetadata)

        if self.time_range:
            time_range_proto = dict_to_proto(self.time_range, TimeRange)

        return WorkflowExecutionProto(
            id=UInt64Value(value=self.id),
            workflow_run_id=StringValue(value=self.workflow_run_id),
            workflow=self.workflow.proto_partial,
            status=self.status,
            scheduled_at=int(self.scheduled_at.replace(tzinfo=timezone.utc).timestamp()),
            expiry_at=int(self.expiry_at.replace(tzinfo=timezone.utc).timestamp()) if self.expiry_at else 0,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            started_at=int(self.started_at.replace(tzinfo=timezone.utc).timestamp()) if self.started_at else 0,
            finished_at=int(self.finished_at.replace(tzinfo=timezone.utc).timestamp()) if self.finished_at else 0,
            created_by=StringValue(value=self.created_by) if self.created_by else None,
            execution_configuration=execution_configuration,
            metadata=metadata,
            time_range=time_range_proto,
            keep_alive=BoolValue(value=self.keep_alive) if self.keep_alive else BoolValue(value=False),
            latest_scheduled_at=int(
                self.latest_scheduled_at.replace(tzinfo=timezone.utc).timestamp()) if self.latest_scheduled_at else 0,
            total_executions=UInt64Value(value=self.total_executions)
        )


class WorkflowExecutionLog(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    workflow_execution = models.ForeignKey(WorkflowExecution, on_delete=models.CASCADE, db_index=True)
    playbook_execution = models.ForeignKey(PlayBookExecution, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    @property
    def proto(self) -> WorkflowExecutionLogProto:
        playbook_execution_proto = self.playbook_execution.proto
        return WorkflowExecutionLogProto(
            id=UInt64Value(value=self.id),
            playbook_execution=playbook_execution_proto,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
        )

    @property
    def proto_partial(self) -> WorkflowExecutionLogProto:
        playbook_execution_proto = self.playbook_execution.proto_partial
        return WorkflowExecutionLogProto(
            id=UInt64Value(value=self.id),
            playbook_execution=playbook_execution_proto,
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
        )
