import logging
from hashlib import md5

from django.db.utils import IntegrityError

from accounts.models import Account
from executor.models import PlayBook, PlayBookTaskDefinition, PlayBookStep, PlayBookStepTaskDefinitionMapping, \
    PlayBookStepMapping
from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType
from protos.playbooks.playbook_v2_pb2 import PlaybookTask, PlaybookStep, PlaybookDefinition
from utils.proto_utils import proto_to_dict
from utils.time_utils import current_milli_time

logger = logging.getLogger(__name__)


def validate_playbook_request(playbook: PlaybookDefinition):
    global_variable_set = playbook.global_variable_set
    if global_variable_set:
        for global_variable_key in list(global_variable_set.keys()):
            if not global_variable_key.startswith('$'):
                return False, f"Global Variable Key {global_variable_key} should start with $"
    return True, None


def get_db_playbooks_v2(account: Account, playbook_id=None, playbook_name=None, is_active=None, playbook_ids=None,
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


def get_db_playbook_step_v2(account: Account, playbook_id: str, playbook_step_name=None, is_active=None):
    filters = {'playbook_id': playbook_id}
    if is_active is not None:
        filters['is_active'] = is_active
    if playbook_step_name:
        filters['name'] = playbook_step_name
    try:
        return account.playbookstep_set.filter(**filters)
    except Exception as e:
        logger.error(f"Failed to get playbook steps for account_id {account.id} with error {e}")
    return None


def get_db_playbook_task_definitions_v2(account: Account, playbook_id: str, playbook_step_id, is_active=None):
    filters = {'playbook_id': playbook_id, 'playbook_step_id': playbook_step_id}
    if is_active is not None:
        filters['is_active'] = is_active
    if is_active is not None:
        filters['is_active'] = is_active
    try:
        return account.playbooktaskdefinition_set.filter(**filters)
    except Exception as e:
        logger.error(f"Failed to get playbook task definitions for account_id {account.id} with error {e}")
    return None


def update_or_create_db_playbook_v2(account: Account, created_by, playbook: PlaybookDefinition,
                                    update_mode: bool = False) -> (PlayBook, bool, str):
    is_valid_playbook, err = validate_playbook_request(playbook)
    if not is_valid_playbook:
        return None, f"Invalid Playbook Request: {err}"

    playbook_name = playbook.name.value
    db_playbook = get_db_playbooks_v2(account, playbook_name=playbook_name, created_by=created_by, is_active=True)
    if db_playbook.exists() and not update_mode:
        if db_playbook.is_active:
            return None, f"Playbook with name {playbook_name} already exists"
        else:
            current_millis = current_milli_time()
            db_playbook.name = f'{playbook_name}###(inactive)###{current_millis}'
            db_playbook.save(update_fields=['name'])
    try:
        playbook_steps: [PlaybookStep] = playbook.steps
        db_steps = []
        for step in playbook_steps:
            db_step, err = create_db_step_v2(account, created_by, step)
            if not db_step or err:
                return None, f"Failed to create playbook step with error: {err}"
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
    return db_playbook, None


def create_db_step_v2(account: Account, created_by, step: PlaybookStep) -> (PlayBookStep, str):
    try:
        tasks: [PlaybookTask] = step.tasks
        db_tasks = []
        for task in tasks:
            db_task, err = get_or_create_db_task_v2(account, created_by, task)
            if not db_task or err:
                return None, f"Failed to create task: {task.name.value} for " \
                             f"playbook step {step.name.value} with error {err}"
            db_tasks.append(db_task)

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
            return None, f"Failed to create playbook step with error: {e}"
        for db_task in db_tasks:
            try:
                PlayBookStepTaskDefinitionMapping.objects.get_or_create(account=account,
                                                                        playbook_step=db_step,
                                                                        playbook_task_definition=db_task)
            except Exception as e:
                logger.error(f"Failed to create playbook step task definition mapping for task {db_task.name} "
                             f"with error {e}")
                return None, f"Failed to create playbook step task definition mapping for task {db_task.name}"
        return db_step, None
    except Exception as e:
        return None, f"Failed to create playbook step with error: {e}"


def get_or_create_db_task_v2(account: Account, created_by, task: PlaybookTask) -> (PlayBookTaskDefinition, str):
    task_dict = proto_to_dict(task)
    hash_task_dict = task_dict.copy()
    hash_task_dict.pop('id', None)
    hash_task_dict.pop('name', None)
    hash_task_dict.pop('description', None)
    hash_task_dict.pop('notes', None)
    hash_task_dict.pop('created_by', None)
    hash_task_dict.pop('global_variable_set', None)
    hash_task_dict.pop('interpreter_type', None)
    task_md5 = md5(str(hash_task_dict).encode('utf-8')).hexdigest()
    try:
        db_task, _ = PlayBookTaskDefinition.objects.get_or_create(account=account,
                                                                  name=task.name.value,
                                                                  task_md5=task_md5,
                                                                  created_by=created_by,
                                                                  defaults={'task': task_dict,
                                                                            'description': task.description.value,
                                                                            'is_active': True,
                                                                            'notes': task.notes.value})
        return db_task, None
    except IntegrityError:
        db_task = PlayBookTaskDefinition.objects.get(account=account, name=task.name.value, task_md5=task_md5,
                                                     created_by=created_by)
        return db_task, None
    except Exception as e:
        logger.error(f"Failed to create playbook task definition for task name {task.name.value} with error {e}")
    return None, f"Failed to create playbook task definition for task name {task.name.value} with error {e}"
