from typing import Dict

from executor.data_fetch_task_executor.clickhouse_data_fetch_task_executor import ClickhouseDataFetchTaskExecutor
from executor.data_fetch_task_executor.data_fetch_task_executor import PlaybookDataFetchTaskExecutor
from executor.data_fetch_task_executor.eks_data_fetch_task_executor import EksDataFetchTaskExecutor
from executor.data_fetch_task_executor.postgres_data_fetch_task_executor import PostgresDataFetchTaskExecutor
from executor.data_fetch_task_executor.sql_database_data_fetch_task_executor import SqlDatabaseDataFetchTaskExecutor
from protos.playbooks.playbook_pb2 import PlaybookDataFetchTaskDefinition as PlaybookDataFetchTaskDefinitionProto


class PlaybookDataFetchTaskExecutorFacade:

    def __init__(self):
        self._map = {}

    def register(self, evaluation_type: PlaybookDataFetchTaskDefinitionProto.Source,
                 executor: PlaybookDataFetchTaskExecutor.__class__):
        self._map[evaluation_type] = executor

    def execute_data_fetch_task(self, account_id, global_variable_set: Dict,
                                data_fetch_task: PlaybookDataFetchTaskDefinitionProto):
        source = data_fetch_task.source
        if source not in self._map:
            raise ValueError(f'No executor found for source: {source}')
        executor = self._map[source](account_id)
        try:
            return executor.execute(global_variable_set, data_fetch_task)
        except Exception as e:
            raise Exception(f"Data Fetch Task Failed:: {e}")


data_fetch_task_executor = PlaybookDataFetchTaskExecutorFacade()
data_fetch_task_executor.register(PlaybookDataFetchTaskDefinitionProto.Source.POSTGRES, PostgresDataFetchTaskExecutor)
data_fetch_task_executor.register(PlaybookDataFetchTaskDefinitionProto.Source.EKS, EksDataFetchTaskExecutor)
data_fetch_task_executor.register(PlaybookDataFetchTaskDefinitionProto.Source.CLICKHOUSE,
                                  ClickhouseDataFetchTaskExecutor)
data_fetch_task_executor.register(PlaybookDataFetchTaskDefinitionProto.Source.SQL_DATABASE_CONNECTION,
                                  SqlDatabaseDataFetchTaskExecutor)
