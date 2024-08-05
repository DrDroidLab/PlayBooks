from django.db.models import F
from django.contrib.postgres.aggregates import ArrayAgg
from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from engines.base.column import Column, AnnotatedColumn
from protos.literal_pb2 import LiteralType, Literal, IdLiteral
from protos.playbooks.playbook_commons_pb2 import PlaybookExecutionStatusType
from protos.playbooks.workflow_pb2 import Workflow
from utils.model_utils import generate_choices


def get_proto_choices(proto_enum_class):
    choices = generate_choices(proto_enum_class)
    options: [Literal] = []
    for idx, c in enumerate(choices):
        if idx == 0:
            continue
        options.append(Literal(
            type=LiteralType.ID,
            id=IdLiteral(type=IdLiteral.Type.LONG, long=UInt64Value(value=c[0]), alias=StringValue(value=c[1]))
        ))
    return options


def get_playbook_name_options(account, *args, **kwargs):
    playbooks = account.playbook_set.all()
    playbooks = playbooks.values_list('name')
    options: [Literal] = []
    for playbook in playbooks:
        options.append(Literal(
            type=LiteralType.STRING,
            string=StringValue(value=playbook[0])
        ))
    return options


def get_playbook_created_by_options(account, *args, **kwargs):
    playbooks = account.playbook_set.all()
    playbooks = playbooks.values_list('created_by').distinct()
    options: [Literal] = []
    for playbook in playbooks:
        options.append(Literal(
            type=LiteralType.STRING,
            string=StringValue(value=playbook[0])
        ))
    return options


def get_playbook_execution_status_options(account, *args, **kwargs):
    return get_proto_choices(PlaybookExecutionStatusType)


def get_workflow_type_options(account, *args, **kwargs):
    return get_proto_choices(Workflow.Type)


def get_playbook_execution_created_by_options(account, *args, **kwargs):
    playbooks = account.playbookexecution_set.all()
    playbooks = playbooks.values_list('created_by').distinct()
    options: [Literal] = []
    for playbook in playbooks:
        options.append(Literal(
            type=LiteralType.STRING,
            string=StringValue(value=playbook[0])
        ))
    return options


playbook_columns = {
    'name': Column(
        name='name',
        display_name='Playbook Name',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=False,
        options_cb=get_playbook_name_options
    ),
    'created_by': Column(
        name='created_by',
        display_name='Created By',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True,
        options_cb=get_playbook_created_by_options
    ),
}

playbook_execution_columns = {
    'playbook_name': AnnotatedColumn(
        name='playbook_name',
        display_name='PlayBook Name',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True,
        annotation_relation=F('playbook__name'),
        options_cb=get_playbook_name_options
    ),
    'playbook_run_id': Column(
        name='playbook_run_id',
        display_name='PlayBook Run ID',
        type=LiteralType.STRING,
        is_groupable=False,
        is_filterable=True
    ),
    'status': Column(
        name='status',
        display_name='Playbook Status',
        type=LiteralType.ID,
        is_groupable=True,
        is_filterable=True,
        options_cb=get_playbook_execution_status_options
    ),
    'created_by': Column(
        name='created_by',
        display_name='Executed By',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True,
        options_cb=get_playbook_execution_created_by_options
    )
}

workflow_columns = {
    'name': Column(
        name='name',
        display_name='Name',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True
    ),
    'playbook_names': AnnotatedColumn(
        name='playbook_names',
        display_name='Playbooks',
        type=LiteralType.STRING_ARRAY,
        is_filterable=True,
        is_groupable=True,
        annotation_relation=ArrayAgg('playbooks__name'),
    ),
    'type': Column(
        name='type',
        display_name='Workflow Type',
        type=LiteralType.ID,
        is_groupable=True,
        is_filterable=True,
        options_cb=get_workflow_type_options
    ),
    'created_by': Column(
        name='created_by',
        display_name='Created By',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True
    ),
}

workflow_execution_columns = {
    'workflow_name': AnnotatedColumn(
        name='workflow_name',
        display_name='Workflow Name',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True,
        annotation_relation=F('workflow__name')
    ),
    'workflow_run_id': Column(
        name='workflow_run_id',
        display_name='Workflow Run ID',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=False,
    ),
    'playbook_names': AnnotatedColumn(
        name='playbook_names',
        display_name='Playbooks',
        type=LiteralType.STRING_ARRAY,
        is_filterable=True,
        is_groupable=True,
        annotation_relation=ArrayAgg('playbooks__name'),
    ),
    'status': Column(
        name='status',
        display_name='Status',
        type=LiteralType.ID,
        is_filterable=True,
        is_groupable=True
    ),
    'created_by': Column(
        name='created_by',
        display_name='Created By',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True,
    ),
}
