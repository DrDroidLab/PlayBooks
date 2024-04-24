import time
import pytz
from datetime import datetime, timedelta


def current_milli_time():
    return round(time.time() * 1000)


def current_epoch_timestamp():
    return int(time.time())


def current_datetime(timezone=pytz.utc):
    return datetime.now(timezone)


def parse_cron_rule(rule):
    parts = rule.split()
    if len(parts) != 5:
        raise ValueError("Invalid cron rule format")

    minute = parse_part(parts[0], 0, 59)
    hour = parse_part(parts[1], 0, 23)
    day = parse_part(parts[2], 1, 31)
    month = parse_part(parts[3], 1, 12)
    weekday = parse_part(parts[4], 0, 6)

    return minute, hour, day, month, weekday


def parse_part(part, min_val, max_val):
    if part == '*':
        return list(range(min_val, max_val + 1))
    if ',' in part:
        values = []
        for item in part.split(','):
            values.extend(parse_part(item, min_val, max_val))
        return sorted(list(set(values)))
    if '-' in part:
        start, end = map(int, part.split('-'))
        return list(range(start, end + 1))
    if '/' in part:
        start, step = map(int, part.split('/'))
        return list(range(start, max_val + 1, step))
    return [int(part)]


def calculate_cron_times(rule, start_time=None, end_time=None):
    minute, hour, day, month, weekday = parse_cron_rule(rule)

    if start_time is None:
        start_time = datetime.now()
    if end_time is None:
        end_time = start_time + timedelta(days=1)

    cron_times = []
    current_time = start_time
    while current_time < end_time:
        if (current_time.minute in minute and
                current_time.hour in hour and
                current_time.day in day and
                current_time.month in month and
                current_time.weekday() in weekday):
            cron_times.append(current_time)
        current_time += timedelta(minutes=1)

    return cron_times
