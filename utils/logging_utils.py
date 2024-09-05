import logging
from functools import wraps

import uuid


class SingleLineFilter(logging.Filter):
    def filter(self, record):
        if isinstance(record.msg, str):
            record.msg = record.msg.replace('\n', ' ')
        return True


def log_function_call(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        uuid_str = uuid.uuid4().hex
        # Initialize the logger inside the wrapper to get the correct module name
        logger = logging.getLogger(func.__module__)

        # Log the function name and its arguments
        logger.info(f"Call ID: {uuid_str} Function '{func.__name__}', args: {args}, kwargs: {kwargs}")

        # Call the actual function and get the response
        response = func(*args, **kwargs)

        # Log the function's response
        logger.info(f"Call ID: {uuid_str} Function '{func.__name__}' response: {response}")

        return response

    return wrapper
