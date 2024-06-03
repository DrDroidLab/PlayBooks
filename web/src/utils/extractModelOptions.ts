import { taskTypes } from "../constants/index.ts";

export default function extractModelOptions(assets, task) {
  console.log("ass", assets);
  switch (`${task?.source} ${task?.taskType}`) {
    case taskTypes.CLOUDWATCH_LOG_GROUP:
      return {
        regions: assets.map((asset) => asset.region),
      };
    case taskTypes.CLOUDWATCH_METRIC:
      return {
        namespaces: assets.map((asset) => asset.namespace),
      };
    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      return {
        services: assets.map((asset) => {
          const metricFamilies = asset.metrics?.map(
            (metric) => metric.metric_family,
          );
          const uniqueFamilies = [...new Set(metricFamilies)];
          return {
            name: asset.service_name,
            metric_families: uniqueFamilies,
          };
        }),
      };
    case taskTypes.GRAFANA_VPC_PROMQL_METRIC_EXECUTION:
    case taskTypes.GRAFANA_PROMQL_METRIC_EXECUTION:
      return {
        dashboards: assets.map((asset) => {
          return {
            datasource_uid: asset.datasource_uid,
            datasource_name: asset.datasource_name,
          };
        }),
      };
    case taskTypes.GRAFANA_PROMETHEUS_DATASOURCE:
      return {
        prometheus_datasources: assets.map((asset) => {
          return {
            datasource_uid: asset.datasource_uid,
            datasource_name: asset.datasource_name,
          };
        }),
      };
    case taskTypes.AZURE_FILTER_LOG_EVENTS:
      return {
        workspaces: assets.map((asset) => {
          return {
            workspace: asset.workspace,
            name: asset.name,
          };
        }),
      };
    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      return {
        application_names: assets.map((asset) => ({
          application_name: asset.application_name,
          application_entity_guid: asset.application_entity_guid,
        })),
      };
    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      return {
        dashboards: assets.map((asset) => ({
          dashboard_guid: asset.dashboard_guid,
          dashboard_name: asset.dashboard_name,
          page_options: asset.pages,
        })),
      };
    case taskTypes.CLICKHOUSE_SQL_QUERY:
      return {
        databases: assets.map((asset) => asset.database),
      };
    case taskTypes.EKS_GET_DEPLOYMENTS:
      return {
        regions: assets.map((asset) => ({
          region: asset.region,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.EKS_GET_EVENTS:
      return {
        regions: assets.map((asset) => ({
          region: asset.region,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.EKS_GET_PODS:
      return {
        regions: assets.map((asset) => ({
          region: asset.region,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.EKS_GET_SERVICES:
      return {
        regions: assets.map((asset) => ({
          region: asset.region,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.BASH_COMMAND:
      return {};
    default:
      return [];
  }
}
