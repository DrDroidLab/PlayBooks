from dataclasses import dataclass, field
from typing import Optional

from protos.literal_pb2 import LiteralType


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

    def annotate(self):
        return {}


@dataclass
class AnnotatedColumn(Column):
    def annotate(self):
        if self.annotation_relation:
            return {f'{self.name}': self.annotation_relation}
        else:
            raise ValueError('Annotation relation object is not set')
