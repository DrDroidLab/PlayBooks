from playbooks.db.db import use_read_replica_db


def use_read_replica(func):
    def wrapper(*args, **kwargs):
        with use_read_replica_db():
            return func(*args, **kwargs)

    return wrapper
