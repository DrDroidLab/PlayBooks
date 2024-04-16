import logging

from django.db.utils import IntegrityError

from accounts.models import Account, User
from executor.models import PlayBook, PlayBookTaskDefinition, PlayBookStep
from protos.playbooks.playbook_pb2 import PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    Playbook as PlaybookProto, PlaybookStepDefinition
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


def validate_playbook_request(playbook: PlaybookProto):
    global_variable_set = playbook.global_variable_set
    if global_variable_set:
        for global_variable_key in list(global_variable_set.keys()):
            if not global_variable_key.startswith('$'):
                return False, f"Global Variable Key {global_variable_key} should start with $"
    return True, None


def get_db_playbook_dict(db_name=None, requested_name=None, is_active=None):
    db_playbook_default = {'name': db_name}
    if requested_name:
        db_playbook_default['name'] = requested_name
    if is_active is not None:
        db_playbook_default['is_active'] = is_active
    return db_playbook_default


def get_db_playbook(account: Account, playbook_id=None, playbook_name=None, is_active=None):
    filters = {}
    if playbook_id:
        filters['id'] = playbook_id
    if is_active is not None:
        filters['is_active'] = is_active
    if playbook_name:
        filters['name'] = playbook_name
    try:
        return account.playbook_set.filter(**filters)
    except Exception as e:
        print("Failed to get playbook for account_id", account.id, e)
        return None


def get_db_playbook_step(account: Account, playbook: PlayBook, playbook_step_name=None, is_active=None):
    filters = {'playbook_id': playbook.id}
    if is_active is not None:
        filters['is_active'] = is_active
    if playbook_step_name:
        filters['name'] = playbook_step_name
    try:
        return account.playbookstep_set.filter(**filters)
    except Exception as e:
        print("Failed to get playbook step for account_id", account.id, e)
    return None


# TODO(MG): Add validation checks for the playbook
def create_db_playbook(account: Account, user: User, playbook: PlaybookProto, is_generated: bool = False) -> (
        PlayBook, bool, str):
    playbook_name = playbook.name.value
    db_playbook = get_db_playbook(account, playbook_name=playbook_name)
    if not db_playbook.exists():
        try:
            is_valid_playbook, err = validate_playbook_request(playbook)
            if not is_valid_playbook:
                return None, f"Invalid Playbook Request: {err}"
            global_variable_set = None
            if playbook.global_variable_set:
                global_variable_set = proto_to_dict(playbook.global_variable_set)
            db_playbook = PlayBook(account=account,
                                   name=playbook_name,
                                   playbook=playbook,
                                   created_by=user.email,
                                   is_active=True,
                                   global_variable_set=global_variable_set,
                                   is_generated=is_generated)
            db_playbook.save()
        except IntegrityError:
            return None, f"Integrity Error: Playbook with name {playbook_name} already exists"
    else:
        db_playbook = db_playbook.first()
        db_playbook.is_active = True
        update_fields = ['is_active']
        if playbook.global_variable_set:
            db_playbook.global_variable_set = proto_to_dict(playbook.global_variable_set)
            update_fields.append('global_variable_set')
        db_playbook.save(update_fields=update_fields)

    playbook_steps: [PlaybookStepDefinition] = playbook.steps
    for step in playbook_steps:
        create_or_update_playbook_step(account, db_playbook.id, step)
    return db_playbook, None


def create_or_update_playbook_step(scope: Account, playbook_id, playbook_step: PlaybookStepDefinition):
    try:
        account_playbook = scope.playbook_set.get(id=playbook_id)
    except PlayBook.DoesNotExist:
        return None, f"Playbook with requested ids does not exist"
    try:
        metadata = {}
        external_links = playbook_step.external_links

        if external_links:
            el_list = []
            for el in external_links:
                el_list.append({'name': el.name.value, 'url': el.url.value})
            metadata['external_links'] = el_list
        db_playbook_step, is_created = PlayBookStep.objects.update_or_create(account=scope,
                                                                             playbook=account_playbook,
                                                                             name=playbook_step.name.value,
                                                                             metadata=metadata,
                                                                             description=playbook_step.description.value,
                                                                             defaults={'is_active': True})
    except Exception as e:
        return None, f"Error: Exception occurred while retrieving PlaybookStep with " \
                     f"description {playbook_step.description.value} and name {playbook_step.name.value} for " \
                     f"account {scope.id} and playbook {account_playbook.id} with error {e}"

    tasks: [PlaybookTaskDefinitionProto] = playbook_step.tasks
    for task in tasks:
        create_or_update_db_playbook_task_definition(scope, account_playbook.id, db_playbook_step.id, task)


def create_or_update_db_playbook_task_definition(scope: Account, playbook_id, playbook_step_id,
                                                 playbook_task_definition: PlaybookTaskDefinitionProto):
    try:
        account_playbook = scope.playbook_set.get(id=playbook_id)
        account_playbook_step = scope.playbookstep_set.get(id=playbook_step_id, playbook=account_playbook)
    except PlayBook.DoesNotExist or PlayBookStep.DoesNotExist:
        return None, f"Playbook/PlaybookStep with request ids does not exist"
    if playbook_task_definition.type == PlaybookTaskDefinitionProto.Type.METRIC:
        task = playbook_task_definition.metric_task
    elif playbook_task_definition.type == PlaybookTaskDefinitionProto.Type.DECISION:
        task = playbook_task_definition.decision_task
    elif playbook_task_definition.type == PlaybookTaskDefinitionProto.Type.DATA_FETCH:
        task = playbook_task_definition.data_fetch_task
    elif playbook_task_definition.type == PlaybookTaskDefinitionProto.Type.DOCUMENTATION:
        task = playbook_task_definition.documentation_task
    else:
        return None, f"Invalid Task Type Received: {playbook_task_definition.type}"
    try:
        db_playbook_task_definition, is_created = PlayBookTaskDefinition.objects.update_or_create(account=scope,
                                                                                                  playbook=account_playbook,
                                                                                                  playbook_step=account_playbook_step,
                                                                                                  name=playbook_task_definition.name.value,
                                                                                                  description=playbook_task_definition.description.value,
                                                                                                  notes=playbook_task_definition.notes.value,
                                                                                                  type=playbook_task_definition.type,
                                                                                                  defaults={
                                                                                                      'is_active': True,
                                                                                                      'task': proto_to_dict(
                                                                                                          task)})
        return db_playbook_task_definition, None
    except Exception as e:
        logger.error(f"Failed to create playbook task definition for playbook_id {playbook_id} with error {e}")
    return None, "Failed to create playbook task definition"
