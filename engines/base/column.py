import abc
from dataclasses import dataclass, field
from typing import Optional

from protos.literal_pb2 import LiteralType, IdLiteral
from protos.engines.engine_options_pb2 import ColumnOption


class Options(abc.ABC):
    def get_options(self, account, obj):
        pass


@dataclass
class BaseColumn:
    name: str
    display_name: str
    is_filterable: bool

    def annotate(self):
        return {}


@dataclass
class Column(BaseColumn, Options):
    type: LiteralType
    is_groupable: bool
    token_filter_op: Optional[object] = None
    supported_ops: Optional[list] = field(default_factory=list, repr=False)

    def get_options(self, account, obj):
        id_option = None
        if self.type == LiteralType.ID:
            id_option = ColumnOption.IdOption(
                type=IdLiteral.Type.LONG,
            )
        return ColumnOption(
            name=self.name,
            id_option=id_option,
            type=self.type,
            alias=self.display_name,
            is_groupable=self.is_groupable,
        )


@dataclass
class AnnotatedColumn(Column):
    annotation_relation: object = None

    def annotate(self):
        return {f'{self.name}': self.annotation_relation}
