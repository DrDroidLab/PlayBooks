from google.protobuf.wrappers_pb2 import UInt32Value, BoolValue

from protos.base_pb2 import Meta, TimeRange, Page


def get_meta(tr: TimeRange = TimeRange(), page: Page = Page(), total_count: int = 0,
             show_inactive: BoolValue = BoolValue(value=False)):
    return Meta(time_range=tr, page=page, total_count=UInt32Value(value=total_count), show_inactive=show_inactive)
