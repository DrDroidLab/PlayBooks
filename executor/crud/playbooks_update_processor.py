import logging
import uuid

from django.db import IntegrityError

from executor.crud.playbooks_crud import update_or_create_db_playbook
from executor.models import PlayBook
from protos.playbooks.playbook_pb2 import UpdatePlaybookOp
from utils.update_processor_mixin import UpdateProcessorMixin

logger = logging.getLogger(__name__)


class PlaybooksUpdateProcessor(UpdateProcessorMixin):
    update_op_cls = UpdatePlaybookOp

    @staticmethod
    def update_playbook_name(elem: PlayBook, update_op: UpdatePlaybookOp.UpdatePlaybookName) -> PlayBook:
        if not update_op.name.value:
            raise Exception(f"New playbook name missing for update_playbook_name op")
        if update_op.name.value == elem.name:
            return elem
        elem.name = update_op.name.value
        try:
            elem.save(update_fields=['name'])
        except IntegrityError as ex:
            logger.exception(f"Error occurred updating playbook name for {elem.name}, {ex}")
            raise Exception(f"Playbook with name {update_op.name.value} already exists")
        return elem

    @staticmethod
    def update_playbook_status(elem: PlayBook, update_op: UpdatePlaybookOp.UpdatePlaybookStatus) -> PlayBook:
        if not elem.is_active:
            raise Exception(f"Playbook {elem.name} is already inactive")
        if update_op.is_active.value:
            raise Exception(f"Playbook {elem.name} cannot be activated")
        try:
            elem.is_active = update_op.is_active.value
            if not elem.is_active:
                all_playbook_step_mappings = elem.playbookstepmapping_set.all()
                for mapping in all_playbook_step_mappings:
                    mapping.is_active = False
                    mapping.save(update_fields=['is_active'])
                all_workflow_playbook_mappings = elem.workflowplaybookmapping_set.all()
                for workflow_playbook_mapping in all_workflow_playbook_mappings:
                    workflow_playbook_mapping.is_active = False
                    workflow_playbook_mapping.save(update_fields=['is_active'])
                all_playbook_step_task_connector_mappings = elem.playbooksteptaskconnectormapping_set.all()
                for mapping in all_playbook_step_task_connector_mappings:
                    mapping.is_active = False
                    mapping.save(update_fields=['is_active'])
                random_generated_str = str(uuid.uuid4())
                elem.name = f"{elem.name}###(inactive)###{random_generated_str}"
                elem.save(update_fields=['is_active', 'name'])

        except Exception as ex:
            logger.exception(f"Error occurred updating playbook status for {elem.name}, {ex}")
            raise Exception(f"Error occurred updating playbook status for {elem.name}")
        return elem

    @staticmethod
    def update_playbook(elem: PlayBook, update_op: UpdatePlaybookOp.UpdatePlaybook) -> PlayBook:
        if not elem.is_active:
            raise Exception(f"Playbook {elem.name} is inactive")
        try:
            all_playbook_step_mappings = elem.playbookstepmapping_set.all()
            for mapping in all_playbook_step_mappings:
                mapping.is_active = False
                mapping.save(update_fields=['is_active'])
            all_playbook_step_task_connector_mappings = elem.playbooksteptaskconnectormapping_set.all()
            for mapping in all_playbook_step_task_connector_mappings:
                mapping.is_active = False
                mapping.save(update_fields=['is_active'])
            updated_playbook = update_op.playbook
            updated_elem, err = update_or_create_db_playbook(elem.account, elem.created_by, updated_playbook,
                                                             update_mode=True)
            if err:
                raise Exception(f"Error occurred updating playbook for {elem.name}, {err}")
            return updated_elem
        except Exception as ex:
            logger.exception(f"Error occurred updating playbook for {elem.name}, {ex}")
            raise Exception(f"Error occurred updating playbook status for {elem.name}")


playbooks_update_processor = PlaybooksUpdateProcessor()
