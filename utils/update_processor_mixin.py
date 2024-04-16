import copy
from typing import List, Callable, Dict

from django.db import transaction as dj_transaction
from google.protobuf.message import Message


def msg_getter(field_name):
    def getter(msg):
        return getattr(msg, field_name, None)

    getter.__name__ = f'{field_name}_getter'
    return getter


class UpdateProcessorError(ValueError):
    pass


class UpdateProcessorMixin:
    update_op_cls = None

    def __init__(self, *args, **kwargs):
        if self.update_op_cls is None:
            raise Exception("update_op_cls must be set")
        op_enum = self.update_op_cls.DESCRIPTOR.enum_types_by_name['Op']
        self._op_name_dict: Dict[int, Callable] = {
            op.number: op.name.lower() for op in op_enum.values if op.number > 0
        }
        self._op_display_str_dict: Dict[int, Callable] = {
            op.number: op.name.replace('_', ' ').capitalize() for op in op_enum.values if op.number > 0
        }
        self._op_fn_dict: Dict[int, Callable] = {
            op.number: getattr(self, op.name.lower(), None) for op in op_enum.values if op.number > 0
        }
        self._op_msg_field_getter_dict: Dict[int, Callable] = {
            op.number: msg_getter(op.name.lower()) for op in op_enum.values if op.number > 0
        }

    def update(self, elem, update_ops: List[Message]):
        clone_elem = copy.deepcopy(elem)

        with dj_transaction.atomic():
            for update_op in update_ops:
                op = update_op.op
                op_fn = self._op_fn_dict.get(op, None)
                if op_fn is None:
                    raise Exception(f"Unknown op: {op}")
                op_name: str = self._op_name_dict.get(op, '')
                msg_field_getter = self._op_msg_field_getter_dict.get(op, None)
                update_op_msg = msg_field_getter(update_op)
                try:
                    elem = op_fn(elem, update_op_msg)
                    return elem
                except Exception as ex:
                    raise UpdateProcessorError(
                        f"{self._op_display_str_dict.get(op)} error for: {clone_elem.name} - {ex}")
