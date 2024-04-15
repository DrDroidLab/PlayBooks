import threading
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Optional


@dataclass
class DbSelect:
    use_default_db: Optional[bool] = None
    use_read_replicas: Optional[bool] = None
    selected_db: Optional[str] = None


class _DbSelectStorage(threading.local):
    def __init__(self):
        super().__init__()
        self.db_select = DbSelect()


_db_select_storage = _DbSelectStorage()


class DbSelectException(Exception):
    pass


class PresetUseReadReplicaDbException(DbSelectException):
    pass


class PresetUseDefaultDbException(DbSelectException):
    pass


@contextmanager
def use_default_db():
    old_db_select = _db_select_storage.db_select
    if old_db_select.use_read_replicas:
        raise PresetUseReadReplicaDbException('use_read_replicas is already set')
    if old_db_select.use_default_db:
        yield
    else:
        _db_select_storage.db_select = DbSelect(
            use_default_db=True,
            use_read_replicas=False,
            selected_db=None,
        )
        try:
            yield
        finally:
            _db_select_storage.db_select = old_db_select


@contextmanager
def use_read_replica_db():
    old_db_select = _db_select_storage.db_select
    if old_db_select.use_default_db:
        raise PresetUseDefaultDbException('use_default_db is already set')
    if old_db_select.use_read_replicas:
        yield
    else:
        _db_select_storage.db_select = DbSelect(
            use_default_db=False,
            use_read_replicas=True,
            selected_db=None,
        )
        try:
            yield
        finally:
            _db_select_storage.db_select = old_db_select


def get_db_select() -> DbSelect:
    return _db_select_storage.db_select
