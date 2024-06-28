import abc
from dataclasses import dataclass, field
from typing import Callable, Optional

from django.db.models import Subquery, OuterRef

from protos.engines.literal_pb2 import LiteralType, IdLiteral
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

    def annotate_v2(self, paths: []):
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


@dataclass
class AttributeColumn(BaseColumn, Options):
    annotation_relation: object
    attribute_options_cb: Callable
    attribute_field: str = None

    def annotate(self):
        return {f'{self.name}': self.annotation_relation}

    def get_options(self, account, obj):
        return self.attribute_options_cb(self.name, self.display_name, account, obj)


@dataclass
class AttributeColumnV2(BaseColumn, Options):
    general_annotation_relation: str
    associated_model_name: str
    associated_model: object
    attribute_options_cb_v2: Callable

    def annotate_v2(self, path):
        formatted_annotation_string = self.general_annotation_relation.format(path)
        subquery_object = None
        try:
            subquery_object = eval(formatted_annotation_string, {"Subquery": Subquery, "OuterRef": OuterRef,
                                                                 self.associated_model_name: self.associated_model})
        except Exception as e:
            print(f"Error occurred in generating annotation for AttributeColumnV2: {e}")
        if subquery_object:
            return {path: subquery_object}
        return None

    def get_options(self, account, obj):
        return self.attribute_options_cb_v2(account, obj)
