import abc
from abc import abstractmethod
from typing import Dict

from django.db.models import F

from engines.base.column import Column, AttributeColumn, BaseColumn, AttributeColumnV2
from engines.base.literal import literal_to_obj, display_literal, obj_to_literal
from protos.engines.literal_pb2 import Literal, LiteralType
from protos.engines.metric_pb2 import LabelMetadata, Label
from protos.engines.query_base_pb2 import ColumnIdentifier, AttributeIdentifier, Op, AttributeIdentifierV2
from protos.engines.query_base_pb2 import Expression as ExpressionProto


class Filterable(abc.ABC):
    @abstractmethod
    def filter_key(self):
        pass


class Annotable(abc.ABC):
    @abstractmethod
    def annotations(self):
        pass


class Groupable(abc.ABC):
    @abstractmethod
    def group_key(self):
        pass

    @abstractmethod
    def group_label_metadata(self):
        pass

    @abstractmethod
    def group_label(self, obj):
        pass


class Orderable(abc.ABC):
    @abstractmethod
    def order_key(self):
        pass


class Token(abc.ABC):
    @abstractmethod
    def display(self) -> str:
        pass

    def __str__(self):
        return self.display()


class ColumnToken(Token, Filterable, Annotable, Groupable, Orderable):
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

    def group_key(self):
        return self.column_identifier.name

    def group_label_metadata(self):
        return LabelMetadata(
            expression=ExpressionProto(
                column_identifier=self.column_identifier
            ),
            alias=self.column.display_name
        )

    def group_label(self, obj):
        return Label(
            value=obj_to_literal(obj, self._is_id),
        )

    def order_key(self):
        return self.column_identifier.name


class AttributeToken(Token, Filterable, Annotable, Groupable):
    column: AttributeColumn = None
    attribute_identifier: AttributeIdentifier = None

    def __init__(self, column, attribute_identifier):
        self.column = column
        self.attribute_identifier = attribute_identifier
        self._full_path = f'{self.attribute_identifier.path}__{self.attribute_identifier.name}'
        self._group_key_id = f'{self.attribute_identifier.path}_{self.attribute_identifier.name}'

    def display(self) -> str:
        return f'"{self.column.display_name}".{self.attribute_identifier.name}'

    def filter_key(self):
        return self._full_path

    def annotations(self):
        return {**self.column.annotate(), self._group_key_id: F(self._full_path)}

    def group_key(self):
        return self._group_key_id

    def group_label_metadata(self):
        return LabelMetadata(
            expression=ExpressionProto(
                attribute_identifier=self.attribute_identifier
            ),
            alias=self.display()
        )

    def group_label(self, obj):
        return Label(value=obj_to_literal(obj))


class AttributeTokenV2(Token, Filterable, Annotable):
    column: AttributeColumnV2 = None
    attribute_identifier_v2: AttributeIdentifierV2 = None

    def __init__(self, column, attribute_identifier_v2):
        self.column = column
        self.attribute_identifier_v2 = attribute_identifier_v2
        self._paths = self.attribute_identifier_v2.path

    def display(self) -> str:
        return f'"{self.column.display_name}".{self.attribute_identifier_v2.name}'

    def filter_key(self):
        filter_keys = []
        for path in self._paths:
            filter_keys.append(f'{path}__{self.attribute_identifier_v2.name}')
        return filter_keys

    def annotations(self):
        annotations = {}
        for path in self._paths:
            annotations.update(self.column.annotate_v2(path))
        return annotations


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
    def __init__(self, columns: Dict[str, BaseColumn]):
        self._columns = columns

    def _column_tokenizer(self, identifier: ColumnIdentifier) -> Token:
        column = self._columns.get(identifier.name, None)
        if column is None:
            raise ValueError(f'Invalid column name {identifier.name}')
        return ColumnToken(column=column, column_identifier=identifier)

    def _attribute_tokenizer(self, identifier: AttributeIdentifier) -> Token:
        column = self._columns.get(identifier.path, None)
        if column is None:
            raise ValueError(f'Invalid column name {identifier.name}')
        if not isinstance(column, AttributeColumn):
            raise ValueError(f'Invalid column type {identifier.name}')
        return AttributeToken(column=column, attribute_identifier=identifier)

    def _attribute_tokenizer_v2(self, identifier: AttributeIdentifierV2) -> Token:
        column = self._columns.get('free_attribute_search_column', None)
        if column is None:
            raise ValueError(f'Free attribute search not supported for current model and {identifier.name}')
        return AttributeTokenV2(column=column, attribute_identifier_v2=identifier)

    def tokenize(self, expression: ExpressionProto) -> Token:
        if expression.HasField('column_identifier'):
            return self._column_tokenizer(expression.column_identifier)
        elif expression.HasField('attribute_identifier'):
            return self._attribute_tokenizer(expression.attribute_identifier)
        elif expression.HasField('literal'):
            return LiteralToken(literal=expression.literal)
        elif expression.HasField('attribute_identifier_v2'):
            return self._attribute_tokenizer_v2(expression.attribute_identifier_v2)
        return None
