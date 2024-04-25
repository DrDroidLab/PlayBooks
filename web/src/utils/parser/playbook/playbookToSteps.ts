import { SOURCES, models } from "../../../constants/index.ts";
import { Step } from "../../../types.ts";

export const playbookToSteps = (playbook: any, isCopied = false): Step[] => {
  if (!(playbook.steps && playbook.steps.length > 0)) return [];
  const list: Step[] = [];
  for (let [i, step] of playbook.steps.entries()) {
    let additionalData: any = {
      description: step.description ?? `Step - ${i}`,
    };
    let stepSource = step.tasks
      ? step?.tasks[0].metric_task
        ? step.tasks[0].metric_task.source
        : step.tasks[0].data_fetch_task?.source ?? step?.tasks[0].type
      : "";
    let selected = "";
    let modelType = "";
    const task = step.tasks ? step.tasks[0] : null;

    switch (stepSource) {
      case SOURCES.CLOUDWATCH:
        const cloudwatchStep = task?.metric_task?.cloudwatch_task;
        additionalData = {
          ...additionalData,
          namespaceName: cloudwatchStep?.metric_execution_task?.namespace,
          region:
            cloudwatchStep?.metric_execution_task?.region ??
            cloudwatchStep?.filter_log_events_task?.region,
          dimensionName:
            cloudwatchStep?.metric_execution_task?.dimensions[0].name,
          dimensionValue:
            cloudwatchStep?.metric_execution_task?.dimensions[0].value,
          metric: cloudwatchStep?.metric_execution_task?.metric_name,
          logGroup: cloudwatchStep?.filter_log_events_task?.log_group_name,
          cw_log_query: cloudwatchStep?.filter_log_events_task?.filter_query,
        };
        if (cloudwatchStep?.type === "FILTER_LOG_EVENTS") {
          stepSource = "CLOUDWATCH";
          selected = "CLOUDWATCH Log Group";
          modelType = "CLOUDWATCH_LOG_GROUP";
        } else {
          stepSource = "CLOUDWATCH";
          selected = "CLOUDWATCH Metric";
          modelType = "CLOUDWATCH_METRIC";
        }
        break;

      case SOURCES.GRAFANA_VPC:
      case SOURCES.GRAFANA:
        const options = {};
        for (let { name, value } of task?.metric_task?.grafana_task
          ?.promql_metric_execution_task?.promql_label_option_values ?? []) {
          options[name] = value;
        }
        stepSource = "GRAFANA";
        selected =
          stepSource === SOURCES.GRAFANA_VPC
            ? "GRAFANA_VPC PromQL"
            : "GRAFANA PromQL";
        modelType = "GRAFANA_TARGET_METRIC_PROMQL";
        additionalData = {
          ...additionalData,
          type: task?.type ?? "METRIC",
          dashboard: {
            id: task?.metric_task?.grafana_task?.promql_metric_execution_task
              ?.dashboard_uid,
            title:
              task?.metric_task?.grafana_task?.promql_metric_execution_task
                ?.dashboard_title,
          },
          panel: {
            panel_id:
              task?.metric_task?.grafana_task?.promql_metric_execution_task
                ?.panel_id,
            panel_title:
              task?.metric_task?.grafana_task?.promql_metric_execution_task
                ?.panel_title,
          },
          grafanaQuery: {
            expression:
              task?.metric_task?.grafana_task?.promql_metric_execution_task
                ?.promql_expression,
            originalExpression:
              task?.metric_task?.grafana_task?.promql_metric_execution_task
                ?.panel_promql_expression,
          },
          datasource_uid: task?.metric_task?.grafana_task?.datasource_uid,
          selectedOptions: options,
        };
        break;

      case SOURCES.CLICKHOUSE:
        stepSource = "CLICKHOUSE";
        modelType = "CLICKHOUSE_DATABASE";
        selected = "CLICKHOUSE Database";
        additionalData = {
          ...additionalData,
          database: task?.data_fetch_task?.clickhouse_data_fetch_task?.database,
          dbQuery: task?.data_fetch_task?.clickhouse_data_fetch_task?.query,
        };
        break;

      case SOURCES.POSTGRES:
        stepSource = "POSTGRES";
        modelType = "POSTGRES_DATABASE";
        selected = "POSTGRES Database";
        additionalData = {
          ...additionalData,
          database: task?.data_fetch_task?.postgres_data_fetch_task?.database,
          dbQuery: task?.data_fetch_task?.postgres_data_fetch_task?.query,
        };
        break;

      case SOURCES.EKS:
        stepSource = "EKS";
        modelType = "EKS_CLUSTER";
        selected = "EKS Cluster";
        additionalData = {
          ...additionalData,
          eksRegion: task?.data_fetch_task?.eks_data_fetch_task?.region,
          cluster: task?.data_fetch_task?.eks_data_fetch_task?.cluster,
          eksNamespace: task?.data_fetch_task?.eks_data_fetch_task?.namespace,
          command: {
            type: task?.data_fetch_task?.eks_data_fetch_task?.command_type,
            description:
              task?.data_fetch_task?.eks_data_fetch_task?.description,
          },
        };
        break;

      case SOURCES.TEXT:
        stepSource = "";
        selected = "";
        modelType = "";
        // additionalData = {
        // ...additionalData
        // textNotes: task?.documentation_task?.documentation
        // };
        break;

      case SOURCES.NEW_RELIC:
        stepSource = "NEW_RELIC";
        const newRelicStep = task?.metric_task?.new_relic_task;
        additionalData = {
          ...additionalData,
          dashboard: {
            id: newRelicStep?.entity_dashboard_widget_nrql_metric_execution_task
              ?.dashboard_guid,
            title:
              newRelicStep?.entity_dashboard_widget_nrql_metric_execution_task
                ?.dashboard_name,
          },
          golden_metric: {
            golden_metric_name:
              newRelicStep?.entity_application_golden_metric_execution_task
                ?.golden_metric_name,
            golden_metric_unit:
              newRelicStep?.entity_application_golden_metric_execution_task
                ?.golden_metric_unit,
            golden_metric_nrql_expression:
              newRelicStep?.entity_application_golden_metric_execution_task
                ?.golden_metric_nrql_expression,
          },
          application_name:
            newRelicStep.entity_application_golden_metric_execution_task
              ?.application_entity_name,
          assets: {
            application_entity_guid:
              newRelicStep.entity_application_golden_metric_execution_task
                ?.application_entity_guid,
            application_name:
              newRelicStep.entity_application_golden_metric_execution_task
                ?.application_entity_name,
          },
          page: {
            page_guid:
              newRelicStep?.entity_dashboard_widget_nrql_metric_execution_task
                ?.page_guid,
            page_name:
              newRelicStep?.entity_dashboard_widget_nrql_metric_execution_task
                ?.page_name,
          },
          widget: {
            widget_id:
              newRelicStep?.entity_dashboard_widget_nrql_metric_execution_task
                ?.widget_id,
            widget_title:
              newRelicStep?.entity_dashboard_widget_nrql_metric_execution_task
                ?.widget_title,
            widget_nrql_expression:
              newRelicStep?.entity_dashboard_widget_nrql_metric_execution_task
                ?.widget_nrql_expression,
          },
          nrqlData: {
            metric_name: newRelicStep?.nrql_metric_execution_task?.metric_name,
            unit: newRelicStep?.nrql_metric_execution_task?.unit,
            nrql_expression:
              newRelicStep?.nrql_metric_execution_task?.nrql_expression,
          },
        };

        switch (newRelicStep.type) {
          case "ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION":
            selected = "NEW_RELIC Entity Application";
            modelType = models.NEW_RELIC_ENTITY_APPLICATION;
            break;
          case "ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION":
            selected = "NEW_RELIC Entity Dashboard";
            modelType = models.NEW_RELIC_ENTITY_DASHBOARD;
            break;
          case "NRQL_METRIC_EXECUTION":
            selected = "NEW_RELIC Raw NRQL";
            modelType = models.NEW_RELIC_NRQL;
            break;
          default:
            break;
        }
        break;

      case SOURCES.DATADOG:
        stepSource = "DATADOG";
        selected = "DATADOG Service";
        modelType = "DATADOG_SERVICE";
        additionalData = {
          ...additionalData,
          datadogService: {
            name: task?.metric_task?.datadog_task?.service_metric_execution_task
              ?.service_name,
          },
          datadogMetricFamily:
            task?.metric_task?.datadog_task?.service_metric_execution_task
              ?.metric_family,
          datadogEnvironment:
            task?.metric_task?.datadog_task?.service_metric_execution_task
              ?.environment_name,
          datadogMetric:
            task?.metric_task?.datadog_task?.service_metric_execution_task
              ?.metric,
        };
        break;
      default:
        break;
    }

    const data = {
      name: task?.name,
      description: step.description,
      id: task?.id ?? step.id,
      notes: step?.tasks?.length > 0 ? step?.tasks[0].notes : "",
      modelType,
      source: stepSource,
      selectedSource: selected,
      connector_type: stepSource,
      model_type: modelType,
      externalLinks: step.external_links,
      isPrefetched: true,
      isCopied: isCopied,
      isOpen: false,
      globalVariables: Object.entries(playbook.global_variable_set ?? {}).map(
        (val) => {
          return {
            name: val[0],
            value: val[1],
          };
        },
      ),
      ...additionalData,
    };

    list.push(data);
  }
  return list;
};
