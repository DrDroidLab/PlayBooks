import logging
from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue

from executor.source_task_executor.api_task_executor import ApiTaskExecutor
from executor.source_task_executor.bash_task_executor import BashTaskExecutor
from executor.source_task_executor.grafana_executor import GrafanaTaskExecutor
from executor.source_task_executor.grafana_vpc_executor import GrafanaVpcTaskExecutor
from executor.source_task_executor.mimir_task_executor import MimirTaskExecutor
from executor.source_task_executor.newrelic_task_executor import NewRelicTaskExecutor
from executor.source_task_executor.clickhouse_task_executor import ClickhouseTaskExecutor
from executor.source_task_executor.cloudwatch_task_executor import CloudwatchTaskExecutor
from executor.playbook_task_executor import PlaybookTaskExecutor
from executor.source_task_executor.datadog_task_executor import DatadogTaskExecutor
from executor.source_task_executor.eks_task_executor import EksTaskExecutor
from executor.source_task_executor.postgres_task_executor import PostgresTaskExecutor
from executor.source_task_executor.sql_database_connection_executor import SqlDatabaseConnectionTaskExecutor

from protos.base_pb2 import Source
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult

from protos.playbooks.playbook_pb2 import PlaybookTask

logger = logging.getLogger(__name__)


class PlaybookTaskExecutorFacade:

    def __init__(self):
        self._map = {}

    def register(self, source: Source, executor: PlaybookTaskExecutor.__class__):
        self._map[source] = executor

    def execute_task(self, account_id, time_range, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        source = task.source
        if source not in self._map:
            raise ValueError(f'No executor found for source: {source}')
        executor = self._map[source](account_id)
        try:
            return executor.execute(time_range, global_variable_set, task)
        except Exception as e:
            logger.error(f'Error while executing task: {str(e)}')
            return PlaybookTaskResult(error=StringValue(value=str(e)))


executor_facade = PlaybookTaskExecutorFacade()
executor_facade.register(Source.CLOUDWATCH, CloudwatchTaskExecutor)
executor_facade.register(Source.EKS, EksTaskExecutor)
executor_facade.register(Source.DATADOG, DatadogTaskExecutor)
executor_facade.register(Source.NEW_RELIC, NewRelicTaskExecutor)
executor_facade.register(Source.GRAFANA, GrafanaTaskExecutor)
executor_facade.register(Source.GRAFANA_VPC, GrafanaVpcTaskExecutor)
executor_facade.register(Source.GRAFANA_MIMIR, MimirTaskExecutor)

executor_facade.register(Source.POSTGRES, PostgresTaskExecutor)
executor_facade.register(Source.CLICKHOUSE, ClickhouseTaskExecutor)
executor_facade.register(Source.SQL_DATABASE_CONNECTION, SqlDatabaseConnectionTaskExecutor)

executor_facade.register(Source.API, ApiTaskExecutor)
executor_facade.register(Source.BASH, BashTaskExecutor)
