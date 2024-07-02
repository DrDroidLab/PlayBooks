import abc
from abc import abstractmethod
from typing import Dict

from engines.query_engine.columns.column import Column
from engines.base.literal import literal_to_obj, display_literal
from protos.literal_pb2 import Literal, LiteralType
from protos.base_pb2 import Op
from protos.query_base_pb2 import ColumnIdentifier, Expression as ExpressionProto


class Filterable(abc.ABC):
    @abstractmethod
    def filter_key(self):
        pass


class Annotable(abc.ABC):
    @abstractmethod
    def annotations(self):
        pass


class Token(abc.ABC):
    @abstractmethod
    def display(self) -> str:
        pass

    def __str__(self):
        return self.display()


class ColumnToken(Token, Filterable, Annotable):
    column: Column = None
    column_identifier: ColumnIdentifier = None

    def __init__(self, column, column_identifier):
        self.column = column
        self.column_identifier = column_identifier
        self._is_id = self.column.type == LiteralType.ID

    def display(self) -> str:
        return f'"{self.column.display_name}"'

    def filter_key(self):
        return self.column_identifier.name

    def annotations(self):
        return self.column.annotate()


class LiteralToken(Token):
    literal: Literal = None
    literal_value = None

    def __init__(self, literal: Literal):
        self.literal = literal
        self.literal_value = literal_to_obj(literal)

    def display(self) -> str:
        return display_literal(self.literal)


class OpToken(Token):
    op: Op = None

    def __init__(self, op: Op):
        self.op = op

    def display(self) -> str:
        return Op.Name(self.op)


class ExpressionTokenizer:
    def __init__(self, columns: Dict[str, Column]):
        self._columns = columns

    def _column_tokenizer(self, identifier: ColumnIdentifier) -> Token:
        column = self._columns.get(identifier.name, None)
        if column is None:
            raise ValueError(f'Invalid column name {identifier.name}')
        return ColumnToken(column=column, column_identifier=identifier)

    def tokenize(self, expression: ExpressionProto) -> Token:
        if expression.HasField('column_identifier'):
            return self._column_tokenizer(expression.column_identifier)
        elif expression.HasField('literal'):
            return LiteralToken(literal=expression.literal)
        return None
