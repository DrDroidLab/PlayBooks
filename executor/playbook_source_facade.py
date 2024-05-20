import logging
from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue

from connectors.models import integrations_connector_type_display_name_map
from executor.source_task_executor.api_task_executor import ApiSourceManager
from executor.source_task_executor.bash_task_executor import BashSourceManager
from executor.source_task_executor.grafana_executor import GrafanaSourceManager
from executor.source_task_executor.grafana_vpc_executor import GrafanaVpcSourceManager
from executor.source_task_executor.mimir_task_executor import MimirSourceManager
from executor.source_task_executor.newrelic_task_executor import NewRelicSourceManager
from executor.source_task_executor.clickhouse_task_executor import ClickhouseSourceManager
from executor.source_task_executor.cloudwatch_task_executor import CloudwatchSourceManager
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_task_executor.datadog_task_executor import DatadogSourceManager
from executor.source_task_executor.eks_task_executor import EksSourceManager
from executor.source_task_executor.postgres_task_executor import PostgresSourceManager
from executor.source_task_executor.sql_database_connection_executor import SqlDatabaseConnectionSourceManager
from executor.utils.playbooks_builder_utils import model_type_display_name_maps

from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookSourceOptions

from protos.playbooks.playbook_pb2 import PlaybookTask

logger = logging.getLogger(__name__)


class PlaybookSourceFacade:

    def __init__(self):
        self._map = {}

    def register(self, source: Source, manager: PlaybookSourceManager.__class__):
        self._map[source] = manager

    def get_source_options(self, account_id) -> [PlaybookSourceOptions]:
        source_options: [PlaybookSourceOptions] = []
        for source, manager in self._map.items():
            connector_options: [PlaybookSourceOptions.ConnectorOption] = []
            try:
                connector_protos: [ConnectorProto] = manager.get_active_connectors(account_id)
                for cp in connector_protos:
                    connector_options.append(PlaybookSourceOptions.ConnectorOption(connector_id=cp.id,
                                                                                   display_name=cp.display_name))
            except Exception as e:
                logger.error(f'Error while getting connector options for source: {str(e)}')
            st_map = manager.get_task_type_callable_map()
            all_task_types = []
            for task_type, task_info in st_map.items():
                display_name = task_info['display_name']
                task_type_name = task_info['task_type']
                model_types = task_info['model_types']
                model_options: [PlaybookSourceOptions.TaskTypeOption.SourceModelTypeMap] = []
                for m in model_types:
                    model_type_display_name = model_type_display_name_maps.get(m, SourceModelType.Name(m))
                    model_options.append(
                        PlaybookSourceOptions.TaskTypeOption.SourceModelTypeMap(model_type=m, display_name=StringValue(
                            value=model_type_display_name)))
                all_task_types.append(
                    PlaybookSourceOptions.TaskTypeOption(display_name=StringValue(value=display_name),
                                                         task_type=StringValue(value=task_type_name),
                                                         supported_model_types=model_options))
            display_name = integrations_connector_type_display_name_map.get(source, Source.Name(source))
            source_options.append(PlaybookSourceOptions(source=source,
                                                        display_name=StringValue(value=display_name),
                                                        supported_task_type_options=all_task_types,
                                                        connector_options=connector_options))
        return source_options

    def execute_task(self, account_id, time_range, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        source = task.source
        if source not in self._map:
            raise ValueError(f'No executor found for source: {source}')
        manager = self._map[source]
        try:
            return manager.execute_task(account_id, time_range, global_variable_set, task)
        except Exception as e:
            logger.error(f'Error while executing task: {str(e)}')
            return PlaybookTaskResult(error=StringValue(value=str(e)))


playbook_source_facade = PlaybookSourceFacade()
playbook_source_facade.register(Source.CLOUDWATCH, CloudwatchSourceManager())
playbook_source_facade.register(Source.EKS, EksSourceManager())
playbook_source_facade.register(Source.DATADOG, DatadogSourceManager())
playbook_source_facade.register(Source.NEW_RELIC, NewRelicSourceManager())
playbook_source_facade.register(Source.GRAFANA, GrafanaSourceManager())
playbook_source_facade.register(Source.GRAFANA_VPC, GrafanaVpcSourceManager())
playbook_source_facade.register(Source.GRAFANA_MIMIR, MimirSourceManager())

playbook_source_facade.register(Source.POSTGRES, PostgresSourceManager())
playbook_source_facade.register(Source.CLICKHOUSE, ClickhouseSourceManager())
playbook_source_facade.register(Source.SQL_DATABASE_CONNECTION, SqlDatabaseConnectionSourceManager())

playbook_source_facade.register(Source.API, ApiSourceManager())
playbook_source_facade.register(Source.BASH, BashSourceManager())
