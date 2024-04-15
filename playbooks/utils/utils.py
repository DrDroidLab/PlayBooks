import time
import pytz
from datetime import datetime


def current_milli_time():
    return round(time.time() * 1000)


def current_epoch_timestamp():
    return int(time.time())


def current_datetime(timezone=pytz.utc):
    return datetime.now(timezone)

# def infer_value_type(v):
#     if isinstance(v, str):
#         return EventKeyProto.KeyType.STRING, ValueProto(string_value=v)
#     elif isinstance(v, bool):
#         return EventKeyProto.KeyType.BOOLEAN, ValueProto(bool_value=v)
#     elif isinstance(v, int):
#         return EventKeyProto.KeyType.LONG, ValueProto(int_value=v)
#     elif isinstance(v, float):
#         return EventKeyProto.KeyType.DOUBLE, ValueProto(double_value=v)
#     return EventKeyProto.KeyType.UNKNOWN, None
#
#
# def transform_event_json(event_json: dict):
#     if not event_json:
#         return None
#     event_name: str = event_json.get('name', '')
#     if not event_name:
#         return None
#     payload = event_json.get('payload', None)
#     if not isinstance(payload, dict):
#         return None
#
#     timestamp_in_ms = event_json.get('timestamp', current_milli_time())
#
#     kvlist = []
#     for key, value in payload.items():
#         _, proto_value = infer_value_type(value)
#         if not proto_value:
#             continue
#         kvlist.append(KeyValue(key=key, value=proto_value))
#
#     return IngestionEvent(name=event_name, kvs=kvlist, timestamp=timestamp_in_ms)
