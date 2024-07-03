from engines.base.context import ContextResolver
from engines.query_engine.query_engine import QueryEngine
from executor.engine_manager.model_columns import playbook_columns, playbook_execution_columns, workflow_columns, \
    workflow_execution_columns
from executor.models import PlayBook, PlayBookExecution
from executor.workflows.models import Workflow, WorkflowExecution
from protos.base_pb2 import Context


class PlayBookContextResolver(ContextResolver):
    columns = playbook_columns
    timestamp_field = 'created_at'

    def qs(self, account):
        return account.playbook_set.all()


class PlayBookExecutionContextResolver(ContextResolver):
    columns = playbook_execution_columns
    timestamp_field = 'created_at'
    parent_model = PlayBook
    parent_column_name = 'playbook_id'

    def qs(self, account):
        return account.playbookexecution_set.all()


class WorkflowContextResolver(ContextResolver):
    columns = workflow_columns
    timestamp_field = 'created_at'

    def qs(self, account):
        return account.workflow_set.all()


class WorkflowExecutionContextResolver(ContextResolver):
    columns = workflow_execution_columns
    timestamp_field = 'created_at'
    parent_model = Workflow
    parent_column_name = 'workflow_id'

    def qs(self, account):
        return account.workflowexecution_set.all()


_context_to_query_engine = {
    Context.PLAYBOOK: QueryEngine(PlayBook, PlayBookContextResolver()),
    Context.PLAYBOOK_EXECUTION: QueryEngine(PlayBookExecution, PlayBookExecutionContextResolver()),
    Context.WORKFLOW: QueryEngine(Workflow, WorkflowContextResolver()),
    Context.WORKFLOW_EXECUTION: QueryEngine(WorkflowExecution, WorkflowExecutionContextResolver()),
}


def get_query_engine(context: Context) -> QueryEngine:
    return _context_to_query_engine.get(context, None)
