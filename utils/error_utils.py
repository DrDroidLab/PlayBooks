import traceback


def error_dict(message: str, ex: Exception):
    return {
        'message': message,
        'error': traceback.format_exception(type(ex), ex, ex.__traceback__)
    }
