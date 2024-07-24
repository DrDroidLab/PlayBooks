import { taskTypes } from "../constants/index.ts";
import { Sources } from "../types/sources.ts";
import { Task } from "../types/task.ts";
import { TaskDetails } from "../types/taskDetails.ts";
import { KeyType } from "./playbook/key.ts";
import { taskTypeOptionMappings } from "./playbook/taskTypeOptionMappings.ts";

export default function extractOptions(task: Task, key: KeyType) {
  const source = task.source;
  const taskType = (
    (task as any)[source.toLowerCase() as Sources] as TaskDetails
  ).type;

  const optionsFunction = taskTypeOptionMappings[`${source} ${taskType}`];

  if (optionsFunction) {
    return optionsFunction(key, task);
  }

  return [];

  switch (`${source} ${taskType}`) {
    case taskTypes.CLOUDWATCH_METRIC:
      return assets.map((asset: any) => ({
        id: asset.namespace,
        label: asset.namespace,
      }));
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
    case taskTypes.GRAFANA_PROMETHEUS_DATASOURCE:
      return {
        prometheus_datasources: assets.map((asset) => {
          return {
            datasource_name: asset.datasource_name,
            datasource_uid: asset.datasource_uid,
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
    case taskTypes.EKS_KUBECTL_COMMAND:
      return {
        regions: assets.map((asset) => ({
          region: asset.region,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.GKE_GET_DEPLOYMENTS:
      return {
        zones: assets.map((asset) => ({
          zone: asset.zone,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.GKE_KUBECTL_COMMAND:
      return {
        zones: assets.map((asset) => ({
          zone: asset.zone,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.GKE_GET_EVENTS:
      return {
        zones: assets.map((asset) => ({
          zone: asset.zone,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.GKE_GET_PODS:
      return {
        zones: assets.map((asset) => ({
          zone: asset.zone,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.GKE_GET_SERVICES:
      return {
        zones: assets.map((asset) => ({
          zone: asset.zone,
          clusters: asset.clusters,
        })),
      };
    case taskTypes.BASH_COMMAND:
      return {
        ssh_servers: assets?.map((asset) => asset.name) ?? [],
      };
    case taskTypes.ELASTIC_SEARCH_QUERY_LOGS:
      return {
        indexes: assets?.map((asset) => asset.index) ?? [],
      };
    default:
      return [];
  }
}
