from dataclasses import dataclass
from datetime import datetime, timedelta

import pytz
from django.db.models import QuerySet

from protos.event.base_pb2 import TimeRange


@dataclass
class DateTimeRange:
    time_geq: datetime
    time_lt: datetime

    def to_tr(self):
        return TimeRange(time_geq=int(self.time_geq.timestamp()), time_lt=int(self.time_lt.timestamp()))

    def to_tr_str(self):
        return to_str(self.time_geq), to_str(self.time_lt)

    def to_tr_int(self):
        return int(self.time_geq.timestamp()), int(self.time_lt.timestamp())

    def get_prev_dtr(self, offset):
        offset_seconds = time_offset_to_seconds(offset)
        return DateTimeRange(time_geq=self.time_geq - timedelta(seconds=offset_seconds),
                             time_lt=self.time_lt - timedelta(seconds=offset_seconds))


def to_dtr(tr: TimeRange = None, now=None, delta=timedelta(minutes=5)):
    if not now:
        now = datetime.now(tz=pytz.UTC)
    if not tr:
        return DateTimeRange(time_geq=(now - delta), time_lt=now)
    if tr.time_lt > 0:
        time_lt = datetime.utcfromtimestamp(tr.time_lt).replace(tzinfo=pytz.utc)
    else:
        time_lt = now

    if tr.time_geq > 0:
        time_geq = datetime.utcfromtimestamp(tr.time_geq).replace(tzinfo=pytz.utc)
    else:
        time_geq = time_lt - delta

    return DateTimeRange(time_geq=time_geq, time_lt=time_lt)


def filter_dtr(qs: QuerySet, dtr: DateTimeRange, ts_field: str):
    ts_filter_map = {
        f'{ts_field}__gte': dtr.time_geq,
        f'{ts_field}__lt': dtr.time_lt,
    }
    return qs.filter(**ts_filter_map)


def filter_str_dtr(qs: QuerySet, start_time: str, end_time: str, ts_field: str):
    ts_filter_map = {
        f'{ts_field}__gte': start_time,
        f'{ts_field}__lt': end_time,
    }
    return qs.filter(**ts_filter_map)


def to_tr(dtr: DateTimeRange):
    return dtr.to_tr()


def to_str(t: datetime):
    return t.strftime('%Y-%m-%d %H:%M:%S')


def time_offset_to_seconds(offset_str):
    if not isinstance(offset_str, str):
        raise ValueError("Input must be a string.")

    # Define mapping for time units to seconds
    time_unit_map = {
        's': 1,
        'm': 60,
        'h': 3600,
        'd': 86400,
        'w': 604800,
        'mo': 2592000  # Assuming a month has 30 days for simplicity
    }

    # Parse the offset_str
    try:
        num = int(offset_str[:-1])
        unit = offset_str[-1]
    except (ValueError, IndexError):
        raise ValueError("Invalid time offset string format.")

    # Convert to seconds
    if unit in time_unit_map:
        return num * time_unit_map[unit]
    else:
        raise ValueError("Invalid time unit. Use 's', 'm', 'h', 'd', 'w', or 'mo'.")


def generate_batch_datetime_chunks(start_datetime, end_datetime):
    current_datetime = start_datetime
    while current_datetime < end_datetime:
        yield current_datetime
        current_datetime += timedelta(hours=1)


def generate_batch_timestamp_chunks(start_timestamp, end_timestamp, chunk_size=3600):
    current_timestamp = start_timestamp
    while current_timestamp < end_timestamp:
        yield current_timestamp
        current_timestamp += chunk_size
