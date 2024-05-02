from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto

metric_source_displace_name_map = {
    PlaybookMetricTaskDefinitionProto.Source.CLOUDWATCH: 'Cloudwatch',
    PlaybookMetricTaskDefinitionProto.Source.GRAFANA: 'Grafana',
    PlaybookMetricTaskDefinitionProto.Source.GRAFANA_VPC: 'Grafana',
    PlaybookMetricTaskDefinitionProto.Source.NEW_RELIC: 'New Relic',
    PlaybookMetricTaskDefinitionProto.Source.DATADOG: 'Datadog'
}
