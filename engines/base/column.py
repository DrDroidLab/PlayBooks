from dataclasses import dataclass, field
from typing import Optional, Callable, Dict

from google.protobuf.wrappers_pb2 import StringValue

from protos.literal_pb2 import LiteralType
from protos.query_base_pb2 import ColumnOption


@dataclass
class Column:
    name: str
    display_name: str
    type: LiteralType
    is_filterable: bool
    is_groupable: bool
    token_filter_op: Optional[object] = None
    supported_ops: Optional[list] = field(default_factory=list, repr=False)
    annotation_relation: object = None
    options_cb: Callable = None

    def annotate(self):
        return {}

    def get_options(self, account, *args, **kwargs):
        if self.options_cb:
            options = self.options_cb(account, *args, **kwargs)
            return ColumnOption(
                name=StringValue(value=self.name),
                alias=StringValue(value=self.display_name),
                type=self.type,
                options=options
            )
        else:
            return ColumnOption(
                name=StringValue(value=self.name),
                alias=StringValue(value=self.display_name),
                type=self.type,
            )


@dataclass
class AnnotatedColumn(Column):
    def annotate(self):
        if self.annotation_relation:
            return {f'{self.name}': self.annotation_relation}
        else:
            raise ValueError('Annotation relation object is not set')


class ColumnOptions:
    def __init__(self, columns: Dict):
        self._columns = columns

    def get_filter_options(self, account, *args, **kwargs):
        column_options = []
        for column_name, column in self._columns.items():
            if column.is_filterable:
                if isinstance(column, Column):
                    column_options.append(column.get_options(account, *args, **kwargs))
        return column_options
