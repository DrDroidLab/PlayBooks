from django.db.models import F
from django.contrib.postgres.aggregates import ArrayAgg

from engines.query_engine.columns.column import Column, AnnotatedColumn
from protos.literal_pb2 import LiteralType

playbook_columns = {
    'name': Column(
        name='name',
        display_name='Playbook Name',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=False
    ),
    'created_by': Column(
        name='created_by',
        display_name='Created By',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True
    ),
}

playbook_execution_columns = {
    'playbook': AnnotatedColumn(
        name='playbook_name',
        display_name='PlayBook Name',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True,
        annotation_relation=F('playbook__name')
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
    ),
    'created_by': Column(
        name='created_by',
        display_name='Executed By',
        type=LiteralType.STRING,
        is_filterable=True,
        is_groupable=True
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
    'playbooks': Column(
        name='playbooks',
        display_name='Playbooks',
        type=LiteralType.STRING_ARRAY,
        is_filterable=True,
        is_groupable=True,
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
    'playbooks': AnnotatedColumn(
        name='playbooks',
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
