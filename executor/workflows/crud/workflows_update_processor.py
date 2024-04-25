import logging
import uuid

from django.db import IntegrityError

from executor.workflows.crud.workflows_crud import create_db_workflow
from executor.workflows.models import Workflow
from protos.playbooks.workflow_pb2 import UpdateWorkflowOp
from utils.update_processor_mixin import UpdateProcessorMixin

logger = logging.getLogger(__name__)


class WorkflowsUpdateProcessor(UpdateProcessorMixin):
    update_op_cls = UpdateWorkflowOp

    @staticmethod
    def update_workflow_name(elem: Workflow, update_op: UpdateWorkflowOp.UpdateWorkflowName) -> Workflow:
        if not update_op.name.value:
            raise Exception(f"New workflow name missing for update_workflow_name op")
        if update_op.name.value == elem.name:
            return elem
        elem.name = update_op.name.value
        try:
            elem.save(update_fields=['name'])
        except IntegrityError as ex:
            logger.exception(f"Error occurred updating workflow name for {elem.name}")
            raise Exception(f"Workflow with name {update_op.name.value} already exists")
        return elem

    @staticmethod
    def update_workflow_status(elem: Workflow, update_op: UpdateWorkflowOp.UpdateWorkflowStatus) -> Workflow:
        if not elem.is_active:
            raise Exception(f"Workflow {elem.name} is already inactive")
        if update_op.is_active.value:
            raise Exception(f"Workflow {elem.name} cannot be activated")
        elem.is_active = update_op.is_active.value
        try:
            if not elem.is_active:
                all_workflow_playbook = elem.workflowplaybookmapping_set.all()
                for pb_mapping in all_workflow_playbook:
                    pb_mapping.is_active = False
                    pb_mapping.save(update_fields=['is_active'])
                all_workflow_entry_points_mapping = elem.workflowentrypointmapping_set.all()
                for entry_point_mapping in all_workflow_entry_points_mapping:
                    entry_point_mapping.is_active = False
                    entry_point_mapping.save(update_fields=['is_active'])
                all_workflow_actions_mapping = elem.workflowactionmapping_set.all()
                for action_mapping in all_workflow_actions_mapping:
                    action_mapping.is_active = False
                    action_mapping.save(update_fields=['is_active'])
                random_generated_str = str(uuid.uuid4())
                elem.name = f"{elem.name}###(inactive)###{random_generated_str}"
                elem.save(update_fields=['is_active', 'name'])
        except Exception as ex:
            logger.exception(f"Error occurred updating workflow status for {elem.name}")
            raise Exception(f"Error occurred updating workflow status for {elem.name}")
        return elem

    @staticmethod
    def update_workflow(elem: Workflow, update_op: UpdateWorkflowOp.UpdateWorkflow) -> Workflow:
        if not elem.is_active:
            raise Exception(f"Workflow {elem.name} is inactive")
        try:
            all_workflow_playbook = elem.workflowplaybookmapping_set.all()
            for pb_mapping in all_workflow_playbook:
                pb_mapping.is_active = False
                pb_mapping.save(update_fields=['is_active'])
            all_workflow_entry_points_mapping = elem.workflowentrypointmapping_set.all()
            for entry_point_mapping in all_workflow_entry_points_mapping:
                entry_point_mapping.is_active = False
                entry_point_mapping.save(update_fields=['is_active'])
            all_workflow_actions_mapping = elem.workflowactionmapping_set.all()
            for action_mapping in all_workflow_actions_mapping:
                action_mapping.is_active = False
                action_mapping.save(update_fields=['is_active'])
            random_generated_str = str(uuid.uuid4())
            elem.name = f"{elem.name}###(inactive)###{random_generated_str}"
            elem.save(update_fields=['is_active', 'name'])
            updated_workflow = update_op.workflow
            updated_elem, err = create_db_workflow(elem.account, elem.created_by, updated_workflow)
            if err:
                raise Exception(err)
            return updated_elem
        except Exception as ex:
            logger.exception(f"Error occurred updating workflow for {elem.name}, {str(ex)}")
            raise Exception(f"Error occurred updating workflow status for {elem.name}, {str(ex)}")

    @staticmethod
    def update_workflow_entry_point_status(elem: Workflow,
                                           update_op: UpdateWorkflowOp.UpdateWorkflowEntryPointStatus) -> Workflow:
        if not elem.is_active:
            raise Exception(f"Workflow {elem.name} is inactive")
        try:
            entry_point_id = update_op.entry_point_id.value
            all_workflow_entry_point_mapping = elem.workflowentrypointmapping_set.filter(id=entry_point_id)
            if not all_workflow_entry_point_mapping.exists():
                raise Exception(f"Entry Point with id {entry_point_id} not found")
            entry_point_mapping = all_workflow_entry_point_mapping.first()
            entry_point_mapping.is_active = update_op.is_active.value
            entry_point_mapping.save(update_fields=['is_active'])
        except Exception as ex:
            logger.exception(f"Error occurred updating workflow status for {elem.name}")
            raise Exception(f"Error occurred updating workflow status for {elem.name}, {str(ex)}")
        return elem

    @staticmethod
    def update_workflow_action_status(elem: Workflow,
                                      update_op: UpdateWorkflowOp.UpdateWorkflowActionStatus) -> Workflow:
        if not elem.is_active:
            raise Exception(f"Workflow {elem.name} is inactive")
        try:
            action_id = update_op.action_id.value
            all_workflow_action_mapping = elem.workflowactionmapping_set.filter(id=action_id)
            if not all_workflow_action_mapping.exists():
                raise Exception(f"Action with id {action_id} not found")
            action_mapping = all_workflow_action_mapping.first()
            action_mapping.is_active = update_op.is_active.value
            action_mapping.save(update_fields=['is_active'])
        except Exception as ex:
            logger.exception(f"Error occurred updating workflow status for {elem.name}")
            raise Exception(f"Error occurred updating workflow status for {elem.name}, {str(ex)}")
        return elem

    @staticmethod
    def update_workflow_playbook_status(elem: Workflow,
                                        update_op: UpdateWorkflowOp.UpdateWorkflowPlaybookStatus) -> Workflow:
        if not elem.is_active:
            raise Exception(f"Workflow {elem.name} is inactive")
        try:
            playbook_id = update_op.playbook_id.value
            all_workflow_playbook_mapping = elem.workflowplaybookmapping_set.filter(playbook_id=playbook_id)
            if not all_workflow_playbook_mapping.exists():
                raise Exception(f"Playbook with id {playbook_id} not found")
            playbook_mapping = all_workflow_playbook_mapping.first()
            playbook_mapping.is_active = update_op.is_active.value
            playbook_mapping.save(update_fields=['is_active'])
        except Exception as ex:
            logger.exception(f"Error occurred updating workflow status for {elem.name}")
            raise Exception(f"Error occurred updating workflow status for {elem.name}, {str(ex)}")
        return elem


workflows_update_processor = WorkflowsUpdateProcessor()
