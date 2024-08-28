import logging
from typing import Dict

from google.protobuf.struct_pb2 import Struct
from google.protobuf.wrappers_pb2 import StringValue

from connectors.models import integrations_connector_type_display_name_map
from executor.source_managers.api_source_manager import ApiSourceManager
from executor.source_managers.azure_source_manager import AzureSourceManager
from executor.source_managers.bash_source_manager import BashSourceManager
from executor.source_managers.documentation_source_manager import DocumentationSourceManager
from executor.source_managers.elastic_search_source_manager import ElasticSearchSourceManager
from executor.source_managers.gcm_source_manager import GcmSourceManager
from executor.source_managers.slack_source_manager import SlackSourceManager
from executor.source_managers.smtp_source_manager import SMTPSourceManager
from executor.source_managers.gke_source_manager import GkeSourceManager
from executor.source_managers.grafana_loki_source_manager import GrafanaLokiSourceManager
from executor.source_managers.grafana_source_manager import GrafanaSourceManager
from executor.source_managers.grafana_vpc_source_manager import GrafanaVpcSourceManager
from executor.source_managers.kubernetes_source_manager import KubernetesSourceManager
from executor.source_managers.mimir_source_manager import MimirSourceManager
from executor.source_managers.newrelic_source_manager import NewRelicSourceManager
from executor.source_managers.clickhouse_source_manager import ClickhouseSourceManager
from executor.source_managers.cloudwatch_source_manager import CloudwatchSourceManager
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_managers.datadog_source_manager import DatadogSourceManager
from executor.source_managers.eks_source_manager import EksSourceManager
from executor.source_managers.postgres_source_manager import PostgresSourceManager
from executor.source_managers.zenduty_source_manager import ZendutySourceManager
from executor.source_managers.sql_database_connection_source_manager import SqlDatabaseConnectionSourceManager
from executor.utils.playbooks_builder_utils import model_type_display_name_maps

from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookSourceOptions, PlaybookTaskResultType

from protos.playbooks.playbook_pb2 import PlaybookTask

logger = logging.getLogger(__name__)


class PlaybookSourceFacade:

    def __init__(self):
        self._map = {}

    def register(self, source: Source, manager: PlaybookSourceManager):
        self._map[source] = manager

    def get_source_manager(self, source: Source):
        if source not in self._map:
            raise ValueError(f'No executor found for source: {source}')
        return self._map.get(source)

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
            task_proto = manager.task_proto
            for task_type, task_info in st_map.items():
                display_name = task_info['display_name']
                task_type_name = task_proto.TaskType.Name(task_type)
                task_type_category = task_info.get('category', 'Others')
                model_types = task_info['model_types']
                model_options: [PlaybookSourceOptions.TaskTypeOption.SourceModelTypeMap] = []
                task_result_type = task_info.get('result_type', PlaybookTaskResultType.UNKNOWN)
                form_fields = task_info.get('form_fields', [])
                for m in model_types:
                    model_type_display_name = model_type_display_name_maps.get(m, SourceModelType.Name(m))
                    model_options.append(
                        PlaybookSourceOptions.TaskTypeOption.SourceModelTypeMap(model_type=m, display_name=StringValue(
                            value=model_type_display_name)))
                all_task_types.append(
                    PlaybookSourceOptions.TaskTypeOption(display_name=StringValue(value=display_name),
                                                         task_type=StringValue(value=task_type_name),
                                                         category=StringValue(value=task_type_category),
                                                         supported_model_types=model_options,
                                                         result_type=task_result_type,
                                                         form_fields=form_fields))
            display_name = integrations_connector_type_display_name_map.get(source, Source.Name(source))
            source_options.append(PlaybookSourceOptions(source=source,
                                                        display_name=StringValue(value=display_name),
                                                        supported_task_type_options=all_task_types,
                                                        connector_options=connector_options))
        return source_options

    def execute_task(self, account_id, time_range, global_variable_set: Struct,
                     task: PlaybookTask) -> PlaybookTaskResult:
        source = task.source
        if source not in self._map:
            raise ValueError(f'No executor found for source: {source}')
        manager = self._map[source]
        try:
            return manager.execute_task(account_id, time_range, global_variable_set, task)
        except Exception as e:
            logger.error(f'Error while executing task: {str(e)}')
            return PlaybookTaskResult(error=StringValue(value=str(e)))

    def test_source_connection(self, source_connection: ConnectorProto):
        source = source_connection.type
        if source not in self._map:
            return False, f'No executor found for source: {source}'
        manager = self._map[source]
        try:
            return manager.test_connector_processor(source_connection), None
        except Exception as e:
            logger.error(f'Error while testing source connection: {str(e)}')
            return False, str(e)


playbook_source_facade = PlaybookSourceFacade()
playbook_source_facade.register(Source.CLOUDWATCH, CloudwatchSourceManager())
playbook_source_facade.register(Source.EKS, EksSourceManager())
playbook_source_facade.register(Source.DATADOG, DatadogSourceManager())
playbook_source_facade.register(Source.NEW_RELIC, NewRelicSourceManager())
playbook_source_facade.register(Source.GRAFANA, GrafanaSourceManager())
playbook_source_facade.register(Source.GRAFANA_VPC, GrafanaVpcSourceManager())
playbook_source_facade.register(Source.GRAFANA_MIMIR, MimirSourceManager())
playbook_source_facade.register(Source.AZURE, AzureSourceManager())
playbook_source_facade.register(Source.GKE, GkeSourceManager())
playbook_source_facade.register(Source.GCM, GcmSourceManager())
playbook_source_facade.register(Source.GRAFANA_LOKI, GrafanaLokiSourceManager())

playbook_source_facade.register(Source.POSTGRES, PostgresSourceManager())
playbook_source_facade.register(Source.CLICKHOUSE, ClickhouseSourceManager())
playbook_source_facade.register(Source.SQL_DATABASE_CONNECTION, SqlDatabaseConnectionSourceManager())
playbook_source_facade.register(Source.ELASTIC_SEARCH, ElasticSearchSourceManager())

playbook_source_facade.register(Source.API, ApiSourceManager())
playbook_source_facade.register(Source.BASH, BashSourceManager())
playbook_source_facade.register(Source.KUBERNETES, KubernetesSourceManager())
playbook_source_facade.register(Source.SMTP, SMTPSourceManager())
playbook_source_facade.register(Source.SLACK, SlackSourceManager())

playbook_source_facade.register(Source.DOCUMENTATION, DocumentationSourceManager())
playbook_source_facade.register(Source.ZENDUTY, ZendutySourceManager())
