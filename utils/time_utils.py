import time

import croniter
import pytz
from datetime import datetime, timedelta, date


def get_current_day_epoch():
    current_date = date.today()
    return int(current_date.strftime("%s"))


def get_current_time():
    return time.time()


def current_milli_time():
    return round(time.time() * 1000)


def current_epoch_timestamp():
    return int(time.time())


def current_datetime(timezone=pytz.utc):
    return datetime.now(timezone)


def calculate_interval_times(interval_in_seconds, start_time=None, end_time=None):
    if start_time is None:
        start_time = current_datetime()

    if end_time is None:
        end_time = start_time + timedelta(days=1)

    interval_times = []
    current_time = start_time
    while current_time <= end_time:
        interval_times.append(current_time)
        current_time = current_time + timedelta(seconds=interval_in_seconds)
    return interval_times


def calculate_cron_times(rule, start_time=None, end_time=None):
    if start_time is None:
        start_time = current_datetime()
    if end_time is None:
        end_time = start_time + timedelta(days=1)
    cron = croniter.croniter(rule, start_time)

    cron_times = []
    current_time = start_time
    while current_time <= end_time:
        cron_times.append(current_time)
        next_cron = cron.get_next(datetime)
        current_time = next_cron
    return cron_times
