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


def calculate_next_interval_time(interval_in_seconds, start_time=None, latest_time=None):
    if start_time is None:
        start_time = current_datetime()

    if not latest_time:
        return start_time
    next_interval_time = start_time + timedelta(seconds=interval_in_seconds)
    return next_interval_time


def calculate_next_cron_time(rule, start_time=None, latest_time=None):
    if start_time is None:
        start_time = current_datetime()

    cron = croniter.croniter(rule, start_time)
    if not latest_time:
        next_cron_time = cron.get_next(datetime)
    else:
        next_cron_time = start_time
        while next_cron_time < latest_time:
            next_cron_time = cron.get_next(datetime)
    return next_cron_time


def epoch_to_string(input_time):
    human_readable_time = datetime.fromtimestamp(input_time)
    formatted_time = human_readable_time.strftime('%Y-%m-%d %H:%M:%S')
    return formatted_time
