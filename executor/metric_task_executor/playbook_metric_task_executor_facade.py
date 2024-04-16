from typing import Dict

from executor.metric_task_executor.cloudwatch_task_executor import CloudwatchMetricTaskExecutor
from executor.metric_task_executor.datadog_task_executor import DatadogMetricTaskExecutor
from executor.metric_task_executor.newrelic_task_executor import NewRelicMetricTaskExecutor
from executor.metric_task_executor.playbook_metric_task_executor import PlaybookMetricTaskExecutor
from executor.metric_task_executor.grafana_executor import GrafanaMetricTaskExecutor
from executor.metric_task_executor.grafana_vpc_executor import GrafanaVpcMetricTaskExecutor

from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto


class PlaybookMetricTaskExecutorFacade:

    def __init__(self):
        self._map = {}

    def register(self, source: PlaybookMetricTaskDefinitionProto.Source,
                 executor: PlaybookMetricTaskExecutor.__class__):
        self._map[source] = executor

    def execute_metric_task(self, account_id, time_range, global_variable_set: Dict,
                            metric_task: PlaybookMetricTaskDefinitionProto, ):
        source = metric_task.source
        if source not in self._map:
            raise ValueError(f'No executor found for source: {source}')
        executor = self._map[source](account_id)
        try:
            return executor.execute(time_range, global_variable_set, metric_task)
        except Exception as e:
            raise Exception(f"Metric Task Failed:: {e}")


metric_task_executor = PlaybookMetricTaskExecutorFacade()
metric_task_executor.register(PlaybookMetricTaskDefinitionProto.Source.CLOUDWATCH, CloudwatchMetricTaskExecutor)
metric_task_executor.register(PlaybookMetricTaskDefinitionProto.Source.GRAFANA, GrafanaMetricTaskExecutor)
metric_task_executor.register(PlaybookMetricTaskDefinitionProto.Source.GRAFANA_VPC, GrafanaVpcMetricTaskExecutor)
metric_task_executor.register(PlaybookMetricTaskDefinitionProto.Source.NEW_RELIC, NewRelicMetricTaskExecutor)
metric_task_executor.register(PlaybookMetricTaskDefinitionProto.Source.DATADOG, DatadogMetricTaskExecutor)
