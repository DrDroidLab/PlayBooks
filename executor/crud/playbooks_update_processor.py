import logging
import uuid

from django.db import IntegrityError

from executor.crud.playbooks_crud import create_db_playbook
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
            logger.exception(f"Error occurred updating playbook name for {elem.name}")
            raise Exception(f"Playbook with name {update_op.name.value} already exists")
        return elem

    @staticmethod
    def update_playbook_status(elem: PlayBook, update_op: UpdatePlaybookOp.UpdatePlaybookStatus) -> PlayBook:
        if not elem.is_active:
            raise Exception(f"Playbook {elem.name} is already inactive")
        if update_op.is_active.value:
            raise Exception(f"Playbook {elem.name} cannot be activated")
        elem.is_active = update_op.is_active.value
        try:
            if not elem.is_active:
                all_steps = elem.playbookstep_set.all()
                for step in all_steps:
                    step.is_active = False
                    step.save(update_fields=['is_active'])
                    tasks = step.playbooktaskdefinition_set.all()
                    for task in tasks:
                        task.is_active = False
                        task.save(update_fields=['is_active'])
                all_alert_ops_trigger = elem.alertopstriggerplaybookmapping_set.all()
                for alert_op_trigger in all_alert_ops_trigger:
                    alert_op_trigger.is_active = False
                    alert_op_trigger.save(update_fields=['is_active'])
                random_generated_str = str(uuid.uuid4())
                elem.name = f"{elem.name}###(inactive)###{random_generated_str}"
                elem.save(update_fields=['is_active', 'name'])
        except Exception as ex:
            logger.exception(f"Error occurred updating playbook status for {elem.name}")
            raise Exception(f"Error occurred updating playbook status for {elem.name}")
        return elem

    @staticmethod
    def update_playbook(elem: PlayBook, update_op: UpdatePlaybookOp.UpdatePlaybook) -> PlayBook:
        if not elem.is_active:
            raise Exception(f"Playbook {elem.name} is inactive")
        try:
            all_steps = elem.playbookstep_set.all()
            for step in all_steps:
                step.is_active = False
                step.save(update_fields=['is_active'])
                tasks = step.playbooktaskdefinition_set.all()
                for task in tasks:
                    task.is_active = False
                    task.save(update_fields=['is_active'])
            elem.is_active = False
            random_generated_str = str(uuid.uuid4())
            elem.name = f"{elem.name}###(inactive)###{random_generated_str}"
            elem.save(update_fields=['is_active', 'name'])
            updated_playbook = update_op.playbook
            updated_elem, err = create_db_playbook(elem.account, elem.created_by, updated_playbook)
            if err:
                raise Exception(err)
            return updated_elem
        except Exception as ex:
            logger.exception(f"Error occurred updating playbook for {elem.name}")
            raise Exception(f"Error occurred updating playbook status for {elem.name}")

    @staticmethod
    def update_playbook_alert_ops_trigger_status(elem: PlayBook,
                                                 update_op: UpdatePlaybookOp.UpdatePlaybookAlertOpsTriggerStatus) -> PlayBook:
        if not elem.is_active:
            raise Exception(f"Playbook {elem.name} is inactive")
        try:
            alert_ops_trigger_id = update_op.alert_ops_trigger_id.value
            alert_ops_trigger_mapping = elem.alertopstriggerplaybookmapping_set.filter(
                alert_ops_trigger_id=alert_ops_trigger_id, playbook=elem)
            for aot in alert_ops_trigger_mapping:
                aot.is_active = update_op.is_active.value
                aot.save(update_fields=['is_active'])
        except Exception as ex:
            logger.exception(f"Error occurred updating playbook status for {elem.name}")
            raise Exception(f"Error occurred updating playbook status for {elem.name}")
        return elem


playbooks_update_processor = PlaybooksUpdateProcessor()
