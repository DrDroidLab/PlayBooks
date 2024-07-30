import logging
from hashlib import md5

from django.db.utils import IntegrityError

from accounts.models import Account
from executor.models import PlayBook, PlayBookTask, PlayBookStep, PlayBookStepTaskDefinitionMapping, \
    PlayBookStepMapping, PlayBookStepTaskConnectorMapping, PlayBookStepRelation
from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType
from protos.playbooks.playbook_pb2 import PlaybookTask as PlaybookTaskProto, PlaybookStep as PlaybookStepProto, \
    Playbook as PlaybookProto, PlaybookStepRelation as PlaybookStepRelationProto
from utils.proto_utils import proto_to_dict
from utils.time_utils import current_milli_time

logger = logging.getLogger(__name__)


def validate_playbook_request(playbook: PlaybookProto):
    global_variable_set = playbook.global_variable_set
    if global_variable_set:
        for global_variable_key in list(global_variable_set.keys()):
            if not global_variable_key.startswith('$'):
                return False, f"Global Variable Key {global_variable_key} should start with $"
    return True, None


def get_db_playbooks(account: Account, playbook_id=None, playbook_name=None, is_active=None, playbook_ids=None,
                     created_by=None):
    filters = {}
    if playbook_id:
        filters['id'] = playbook_id
    if is_active is not None:
        filters['is_active'] = is_active
    if playbook_name:
        filters['name'] = playbook_name
    if playbook_ids:
        filters['id__in'] = playbook_ids
    if created_by:
        filters['created_by'] = created_by
    try:
        return account.playbook_set.filter(**filters)
    except Exception as e:
        logger.error(f"Failed to get playbook for account_id {account.id} with error {e}")
        return None


def update_or_create_db_playbook(account: Account, created_by, playbook: PlaybookProto,
                                 update_mode: bool = False) -> (PlayBook, str):
    is_valid_playbook, err = validate_playbook_request(playbook)
    if not is_valid_playbook:
        return None, f"Invalid Playbook Request: {err}"

    playbook_name = playbook.name.value
    db_playbook = get_db_playbooks(account, playbook_name=playbook_name, created_by=created_by, is_active=True)
    if db_playbook.exists() and not update_mode:
        db_playbook = db_playbook.first()
        if db_playbook.is_active:
            return None, f"Playbook with name {playbook_name} already exists"
        else:
            current_millis = current_milli_time()
            db_playbook.name = f'{playbook_name}###(inactive)###{current_millis}'
            db_playbook.save(update_fields=['name'])
    all_task_ref_id_db_id_map = {}
    try:
        playbook_steps: [PlaybookStepProto] = playbook.steps
        db_steps = []
        step_task_connector_map = {}
        step_ref_id_db_id_map = {}
        for step in playbook_steps:
            if not step.reference_id.value:
                return None, f"Reference ID is missing for step {step.name.value}"
            if step.reference_id.value in step_ref_id_db_id_map:
                return None, f"Duplicate reference ID found for step {step.name.value}"
            db_step, task_connectors_map, task_ref_id_db_id_map, err = create_db_step(account, created_by, step)
            all_task_ref_id_db_id_map.update(task_ref_id_db_id_map)
            step_ref_id_db_id_map[step.reference_id.value] = db_step.id
            if not db_step or not task_connectors_map or err:
                return None, f"Failed to create playbook step with error: {err}"
            step_task_connector_map[db_step.id] = task_connectors_map
            db_steps.append(db_step)
    except Exception as e:
        return None, f"Failed to create playbook steps with error: {e}"

    global_variable_set = None
    if playbook.global_variable_set:
        global_variable_set = proto_to_dict(playbook.global_variable_set)

    description = None
    if playbook.description.value:
        description = playbook.description.value
    try:
        db_playbook, _ = PlayBook.objects.update_or_create(account=account,
                                                           name=playbook_name,
                                                           created_by=created_by,
                                                           defaults={'is_active': True,
                                                                     'global_variable_set': global_variable_set,
                                                                     'description': description
                                                                     }
                                                           )
    except Exception as e:
        return None, f"Failed to create playbook with error: {e}"

    for db_step in db_steps:
        try:
            PlayBookStepMapping.objects.create(account=account, playbook=db_playbook, playbook_step=db_step,
                                               is_active=True)
        except Exception as e:
            logger.error(f"Failed to add step {db_step.name} to playbook {db_playbook.name} with error {e}")
    for step_id, tc_map in step_task_connector_map.items():
        for task_id, connector_ids in tc_map.items():
            for connector_id in connector_ids:
                try:
                    PlayBookStepTaskConnectorMapping.objects.get_or_create(account=account,
                                                                           playbook=db_playbook,
                                                                           playbook_step_id=step_id,
                                                                           playbook_task_id=task_id,
                                                                           connector_id=connector_id,
                                                                           defaults={'is_active': True})
                except Exception as e:
                    logger.error(
                        f"Failed to add task connector mapping for task {task_id} with connector {connector_id} "
                        f"to playbook {db_playbook.name} with error {e}")
    try:
        step_relations: [PlaybookStepRelationProto] = playbook.step_relations
        for step_relation in step_relations:
            try:
                parent_step_id = step_ref_id_db_id_map[step_relation.parent.reference_id.value]
                child_step_id = step_ref_id_db_id_map[step_relation.child.reference_id.value]
                if not parent_step_id or not child_step_id:
                    return None, f"Invalid step relation found for playbook {playbook_name}"
                condition = None
                if step_relation.condition:
                    condition = proto_to_dict(step_relation.condition)
                    for r in condition.get('rules', []):
                        task = r.get('task')
                        condition_task = {
                            'id': all_task_ref_id_db_id_map[task['reference_id']],
                            'name': task.get('name', ''),
                        }
                        r['task'] = condition_task

                condition_md5 = md5(str(condition).encode('utf-8')).hexdigest()
                PlayBookStepRelation.objects.get_or_create(account=account,
                                                           playbook=db_playbook,
                                                           parent_id=parent_step_id,
                                                           child_id=child_step_id,
                                                           condition_md5=condition_md5,
                                                           defaults={'condition': condition, 'is_active': True})
            except Exception as e:
                logger.error(f"Failed to create step relations for playbook {db_playbook.name} with error {e}")
                return None, f"Failed to create step relations for playbook {db_playbook.name} with error {e}"
    except Exception as e:
        logger.error(f"Failed to create step relations for playbook {db_playbook.name} with error {e}")
        return None, f"Failed to create step relations for playbook {db_playbook.name} with error {e}"
    return db_playbook, None


def create_db_step(account: Account, created_by, step: PlaybookStepProto) -> (PlayBookStep, dict, dict, str):
    try:
        tasks: [PlayBookTask] = step.tasks
        db_tasks = []
        task_connectors_map = {}
        task_ref_id_db_id_map = {}
        db_task_id_execution_config_map = {}
        for task in tasks:
            db_task, err = get_or_create_db_task(account, created_by, task)
            task_ref_id_db_id_map[task.reference_id.value] = db_task.id
            db_task_id_execution_config_map[db_task.id] = proto_to_dict(task.execution_configuration)
            if not db_task or err:
                return None, None, None, f"Failed to create task: {task.name.value} for " \
                                         f"playbook step {step.name.value} with error {err}"
            db_tasks.append(db_task)
            connector_ids = []
            for tc in task.task_connector_sources:
                connector_ids.append(tc.id.value)
            task_connectors_map[db_task.id] = connector_ids

        metadata = {}
        external_links = step.external_links
        if external_links:
            el_list = []
            for el in external_links:
                el_list.append({'name': el.name.value, 'url': el.url.value})
            metadata['external_links'] = el_list
        try:
            db_step = PlayBookStep.objects.create(account=account,
                                                  name=step.name.value,
                                                  description=step.description.value,
                                                  notes=step.notes.value,
                                                  metadata=metadata,
                                                  interpreter_type=step.interpreter_type if step.interpreter_type else InterpreterType.BASIC_I,
                                                  created_by=created_by)
        except Exception as e:
            return None, None, None, f"Failed to create playbook step with error: {e}"
        for db_task in db_tasks:
            try:
                playbook_task_execution_config = db_task_id_execution_config_map.get(db_task.id, None)
                PlayBookStepTaskDefinitionMapping.objects.get_or_create(account=account,
                                                                        playbook_step=db_step,
                                                                        playbook_task_definition=db_task,
                                                                        playbook_task_execution_config=playbook_task_execution_config)
            except Exception as e:
                logger.error(f"Failed to create playbook step task definition mapping for task {db_task.name} "
                             f"with error {e}")
                return None, None, None, f"Failed to create playbook step task definition mapping for task {db_task.name}"
        return db_step, task_connectors_map, task_ref_id_db_id_map, None
    except Exception as e:
        return None, None, None, f"Failed to create playbook step with error: {e}"


def get_or_create_db_task(account: Account, created_by, task: PlaybookTaskProto) -> (PlaybookTaskProto, str):
    task_dict = proto_to_dict(task)
    task_dict.pop('id', None)
    task_dict.pop('name', None)
    task_dict.pop('description', None)
    task_dict.pop('notes', None)
    task_dict.pop('created_by', None)
    task_dict.pop('global_variable_set', None)
    task_dict.pop('interpreter_type', None)
    task_dict.pop('task_connector_sources', None)
    task_dict.pop('reference_id', None)
    task_dict.pop('execution_configuration', None)
    task_md5 = md5(str(task_dict).encode('utf-8')).hexdigest()
    try:
        db_task, _ = PlayBookTask.objects.update_or_create(account=account,
                                                           name=task.name.value,
                                                           task_md5=task_md5,
                                                           created_by=created_by,
                                                           defaults={'task': task_dict,
                                                                     'description': task.description.value,
                                                                     'notes': task.notes.value})
        return db_task, None
    except IntegrityError:
        db_task = PlayBookTask.objects.get(account=account, name=task.name.value, task_md5=task_md5,
                                           created_by=created_by)
        return db_task, None
    except Exception as e:
        logger.error(f"Failed to create playbook task definition for task name {task.name.value} with error {e}")
        return None, f"Failed to create playbook task definition for task name {task.name.value} with error {e}"
