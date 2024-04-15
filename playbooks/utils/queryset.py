from datetime import datetime

import pytz
from django.db.models import QuerySet

from protos.base_pb2 import Page


def filter_time_range(qs: QuerySet, tr, ts_field: str):
    ts_filter_map = {}
    if tr.time_geq > 0:
        ts_filter_map[f'{ts_field}__gte'] = datetime.utcfromtimestamp(tr.time_geq).replace(tzinfo=pytz.utc)
    if tr.time_lt > 0:
        ts_filter_map[f'{ts_field}__lt'] = datetime.utcfromtimestamp(tr.time_lt).replace(tzinfo=pytz.utc)

    return qs.filter(**ts_filter_map)


def filter_page(qs: QuerySet, p: Page, default_limit=100):
    if not p:
        return qs[0:default_limit]
    if not p.limit.value or p.limit.value > 100:
        p.limit.value = 100
    if p.offset.value:
        return qs[p.offset.value:p.offset.value + p.limit.value]

    p.offset.value = 0
    return qs[:p.limit.value]


def filter_page_for_sql(p: Page):
    filter_str = ""
    if not p:
        return "LIMIT 100 OFFSET 0"
    if not p.limit.value or p.limit.value > 100:
        filter_str = "LIMIT 100"
    if p.offset.value:
        return filter_str + " OFFSET {}".format(p.offset.value)

    p.offset.value = 0
    return "LIMIT {}".format(p.limit.value)
