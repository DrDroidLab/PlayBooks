from abc import abstractmethod

from accounts.models import Account
from engines.query_engine.columns.model_columns import playbook_columns, playbook_execution_columns, workflow_columns, \
    workflow_execution_columns
from engines.query_engine.filters.filter_engine import FilterEngine
from executor.models import PlayBookExecution, PlayBook
from executor.workflows.models import WorkflowExecution, Workflow
from protos.base_pb2 import Op, Context
from protos.literal_pb2 import IdLiteral, Literal, LiteralType
from protos.query_base_pb2 import Filter, Expression, ColumnIdentifier, QueryRequest


class ContextResolver:
    columns = None
    timestamp_field = None
    parent_model = None
    parent_column_name: str = None

    def __init__(self):
        self._filter_engine = FilterEngine(self.columns)

    @abstractmethod
    def qs(self, account):
        raise NotImplementedError()

    def filter_engine(self):
        return self._filter_engine

    def get_parent_obj(self, account, id: IdLiteral = None):
        if id.type == IdLiteral.Type.LONG:
            return self.parent_model.objects.get(account=account, id=id.long.value)
        elif id.type == IdLiteral.Type.STRING:
            return id.string.value

    def get_parent_id_filter(self, id: IdLiteral = None):
        return Filter(
            lhs=Expression(column_identifier=ColumnIdentifier(name=self.parent_column_name, type=LiteralType.ID)),
            op=Op.EQ,
            rhs=Expression(
                literal=Literal(
                    literal_type=LiteralType.ID,
                    id=id
                )
            )
        )

    def get_default_query(self, account, obj=None):
        return QueryRequest()


class PlayBookContextResolver(ContextResolver):
    columns = playbook_columns
    timestamp_field = 'created_at'
    parent_model = PlayBook
    parent_column_name = 'playbook_id'

    def qs(self, account):
        return account.playbook_set.all()

    def get_default_query(self, account, obj=None):
        if type(account) is not Account:
            raise ValueError(f'{account} needs to be Account')

        return QueryRequest(filter=Filter(op=Op.AND, filters=[]))


class PlayBookExecutionContextResolver(ContextResolver):
    columns = playbook_execution_columns
    timestamp_field = 'created_at'
    parent_model = PlayBookExecution
    parent_column_name = 'playbook_execution_id'

    def qs(self, account):
        return account.playbookexecution_set.all()

    def get_default_query(self, account, obj=None):
        if type(account) is not Account:
            raise ValueError(f'{account} needs to be Account')

        return QueryRequest(filter=Filter(op=Op.AND, filters=[]))


class WorkflowContextResolver(ContextResolver):
    columns = workflow_columns
    timestamp_field = 'created_at'
    parent_model = Workflow
    parent_column_name = 'workflow_id'

    def qs(self, account):
        return account.workflow_set.all()

    def get_default_query(self, account, obj=None):
        if type(account) is not Account:
            raise ValueError(f'{account} needs to be Account')

        return QueryRequest(filter=Filter(op=Op.AND, filters=[]))


class WorkflowExecutionContextResolver(ContextResolver):
    columns = workflow_execution_columns
    timestamp_field = 'created_at'
    parent_model = WorkflowExecution
    parent_column_name = 'workflow_execution_id'

    def qs(self, account):
        return account.workflowexecution_set.all()

    def get_default_query(self, account, obj=None):
        if type(account) is not Account:
            raise ValueError(f'{account} needs to be Account')

        return QueryRequest(filter=Filter(op=Op.AND, filters=[]))


_context_to_resolver = {
    Context.PLAYBOOK: PlayBookContextResolver(),
    Context.PLAYBOOK_EXECUTION: PlayBookExecutionContextResolver(),
    Context.WORKFLOW: WorkflowContextResolver(),
    Context.WORKFLOW_EXECUTION: WorkflowExecutionContextResolver(),
}


def get_context_resolver(context: Context) -> ContextResolver:
    return _context_to_resolver.get(context)
