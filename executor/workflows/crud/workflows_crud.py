import logging
from hashlib import md5

from django.db import transaction as dj_transaction

from accounts.models import Account
from executor.crud.playbooks_crud import get_db_playbooks
from executor.workflows.models import Workflow, WorkflowEntryPoint, WorkflowAction, WorkflowEntryPointMapping, \
    WorkflowActionMapping, WorkflowPlayBookMapping

from protos.playbooks.deprecated_playbook_pb2 import DeprecatedPlaybook
from protos.playbooks.workflow_pb2 import Workflow as WorkflowProto, WorkflowEntryPoint as WorkflowEntryPointProto, \
    WorkflowAction as WorkflowActionProto, WorkflowSchedule as WorkflowScheduleProto
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


class WorkflowsCrudException(ValueError):
    pass


def get_db_workflows(account: Account, workflow_id=None, workflow_name=None, is_active=None, created_by=None):
    filters = {}
    if workflow_id:
        filters['id'] = workflow_id
    if workflow_name:
        filters['name'] = workflow_name
    if is_active is not None:
        filters['is_active'] = is_active
    if created_by:
        filters['created_by'] = created_by
    try:
        return account.workflow_set.filter(**filters)
    except Exception as e:
        logger.error(f'Error fetching Workflows: {str(e)}')
        return None


def update_or_create_db_workflow(account: Account, created_by, workflow_proto: WorkflowProto,
                                 update_mode: bool = False) -> (Workflow, str):
    if not workflow_proto.name.value or not workflow_proto.schedule or not workflow_proto.playbooks:
        return None, 'Received invalid Workflow Config'

    name: str = workflow_proto.name.value
    description = workflow_proto.description.value
    wf_schedule_proto: WorkflowScheduleProto = workflow_proto.schedule
    wf_schedule_type = wf_schedule_proto.type
    if wf_schedule_type == WorkflowScheduleProto.Type.UNKNOWN:
        return None, 'Invalid Schedule Type'
    if wf_schedule_type == WorkflowScheduleProto.Type.INTERVAL and not wf_schedule_proto.interval.duration_in_seconds.value:
        return None, 'Invalid Periodic Schedule'
    elif wf_schedule_type == WorkflowScheduleProto.Type.CRON and not wf_schedule_proto.cron.duration_in_seconds.value:
        return None, 'Invalid Cron Schedule'

    wf_schedule = proto_to_dict(wf_schedule_proto)
    wf_configuration = proto_to_dict(workflow_proto.configuration)
    wf_entry_point_protos: [WorkflowEntryPointProto] = workflow_proto.entry_points
    wf_action_protos: [WorkflowActionProto] = workflow_proto.actions

    playbooks: [DeprecatedPlaybook] = workflow_proto.playbooks
    playbook_ids = [pb.id.value for pb in playbooks]
    db_playbooks = get_db_playbooks(account, playbook_ids=playbook_ids, is_active=True)
    if db_playbooks.count() != len(playbook_ids):
        return None, 'Invalid Playbooks in Workflow Config'
    try:
        db_workflows = get_db_workflows(account, workflow_name=name, created_by=created_by)
        if db_workflows.exists() and not update_mode:
            return None, f'Workflow with name: {name} already exists'
    except WorkflowsCrudException as wce:
        return None, str(wce)

    with dj_transaction.atomic():
        try:
            db_w_entry_points = []
            for ep in wf_entry_point_protos:
                ep_type = ep.type
                entry_point = proto_to_dict(ep)
                entry_point_md5 = md5(str(entry_point).encode('utf-8')).hexdigest()
                saved_ep, _ = WorkflowEntryPoint.objects.get_or_create(account=account,
                                                                       type=ep_type,
                                                                       entry_point_md5=entry_point_md5,
                                                                       created_by=created_by,
                                                                       defaults={'is_active': True,
                                                                                 'entry_point': entry_point})
                db_w_entry_points.append(saved_ep)

            db_w_actions = []
            for ap in wf_action_protos:
                ap_type = ap.type
                action = proto_to_dict(ap)
                action_md5 = md5(str(action).encode('utf-8')).hexdigest()
                saved_a, _ = WorkflowAction.objects.get_or_create(account=account,
                                                                  type=ap_type,
                                                                  action_md5=action_md5,
                                                                  created_by=created_by,
                                                                  defaults={'is_active': True, 'action': action})
                db_w_actions.append(saved_a)

            db_workflow, is_created = Workflow.objects.update_or_create(account=account,
                                                                        name=name,
                                                                        created_by=created_by,
                                                                        defaults={
                                                                            'is_active': True,
                                                                            'description': description,
                                                                            'schedule_type': wf_schedule_type,
                                                                            'schedule': wf_schedule,
                                                                            'configuration': wf_configuration
                                                                        })
            for pb in db_playbooks:
                WorkflowPlayBookMapping.objects.update_or_create(account=account, workflow=db_workflow, playbook=pb,
                                                                 defaults={'is_active': True})
            for ep in db_w_entry_points:
                WorkflowEntryPointMapping.objects.update_or_create(account=account, workflow=db_workflow,
                                                                   entry_point=ep, defaults={'is_active': True})
            for ac in db_w_actions:
                WorkflowActionMapping.objects.update_or_create(account=account, workflow=db_workflow, action=ac,
                                                               defaults={'is_active': True})
        except Exception as e:
            logger.error(f'Error creating Workflow: {str(e)}')
            return None, f'Error creating Workflow'
    return db_workflow, None
