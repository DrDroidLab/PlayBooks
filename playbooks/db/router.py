import random
from typing import List

from playbooks.db.db import DbSelect, get_db_select


class DbRouter:
    def __init__(self):
        self._default_db_key: str = 'default'
        self._clickhouse_db_key: str = 'clickhouse'
        self._replica_db_keys: List[str] = ['replica1']
        self._db_set = {'default', *self._replica_db_keys}

    def db_for_read(self, model, **hints):

        if model.__name__ in ['EventsAlertOps']:
            return self._clickhouse_db_key

        db_select: DbSelect = get_db_select()
        if db_select.use_default_db:
            if not db_select.selected_db:
                db_select.selected_db = self._default_db_key

        if db_select.use_read_replicas:
            if not db_select.selected_db:
                db_select.selected_db = random.choice(self._replica_db_keys)

        return db_select.selected_db or self._default_db_key

    def db_for_write(self, model, **hints):
        """
        Writes always go to primary.
        """
        if model.__name__ in ['EventsAlertOps']:
            return self._clickhouse_db_key

        return self._default_db_key

    def allow_relation(self, obj1, obj2, **hints):
        """
        Relations between objects are allowed if both objects are
        in the primary/replica pool.
        """
        if obj1._state.db in self._db_set and obj2._state.db in self._db_set:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == self._default_db_key
