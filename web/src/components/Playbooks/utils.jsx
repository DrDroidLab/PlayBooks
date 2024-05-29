import { v4 as uuidv4 } from 'uuid';

const formatMetricTask = step => {
  let task = null;

  if (step.source.toUpperCase() === 'CLOUDWATCH') {
    task = {
      name: uuidv4(),
      type: 'METRIC',
      description: step.description,
      notes: step.notes,
      metric_task: {
        source: 'CLOUDWATCH',
        cloudwatch_task: {
          type: 'METRIC_EXECUTION',
          metric_execution_task: {
            namespace: step.namespaceName,
            metric_name: step.metric,
            region: step.region,
            process_function: 'timeseries',
            statistic: 'Average',
            dimensions: [
              {
                name: step.dimensionName,
                value: step.dimensionValue
              }
            ]
          }
        }
      }
    };
  }

  if (step.source.toUpperCase() === 'CLOUDWATCH_LOGS') {
    task = {
      name: uuidv4(),
      type: 'METRIC',
      description: step.description,
      notes: step.notes,
      metric_task: {
        source: 'CLOUDWATCH',
        cloudwatch_task: {
          type: 'FILTER_LOG_EVENTS',
          filter_log_events_task: {
            region: step.region,
            log_group_name: step.logGroup,
            filter_query: step.cw_log_query
          }
        }
      }
    };
  }

  if (step.source.toUpperCase() === 'GRAFANA') {
    task = {
      name: uuidv4(),
      type: 'METRIC',
      description: step.description,
      notes: step.notes,
      metric_task: {
        source: step.source.toUpperCase(),
        grafana_task: {
          type: 'PROMQL_METRIC_EXECUTION',
          datasource_uid: step.queryObj.datasource_uid,
          promql_metric_execution_task: {
            promql_expression: step.queryObj.expr,
            process_function: 'timeseries',
            promql_label_option_values: step.promql_label_option_values
          }
        }
      }
    };
  }

  if (step.source.toUpperCase() === 'CLICKHOUSE') {
    task = {
      name: uuidv4(),
      type: 'DATA_FETCH',
      description: step.description,
      notes: step.notes,
      data_fetch_task: {
        source: step.source.toUpperCase(),
        clickhouse_data_fetch_task: {
          database: step.database,
          query: step.db_query
        }
      }
    };
  }

  if (step.source.toUpperCase() === 'TEXT') {
    task = {
      name: uuidv4(),
      type: 'DOCUMENTATION',
      description: step.description,
      notes: step.notes,
      documentation_task: {
        type: 'MARKDOWN',
        documentation: step.text_notes
      }
    };
  }

  if (step.source.toUpperCase() === 'IFRAME') {
    task = {
      name: uuidv4(),
      type: 'IFRAME',
      description: step.description,
      notes: step.notes,
      iframe: {
        iframe_url: step.url
      }
    };
  }

  return task;
};

const getStepTitle = step => {
  if (step.sourceName === 'Cloudwatch') {
    return `${step.namespaceName} : ${step.dimensionName} : ${step.dimensionValue} : ${step.metric}`;
  }
  if (step.sourceName === 'Grafana') {
    let expr = step.queryObj.expr;
    if (step.promql_label_option_values) {
      for (let i = 0; i < step.promql_label_option_values.length; i++) {
        let n = step.promql_label_option_values[i].name;
        let v = step.promql_label_option_values[i].value;
        expr = expr.replace(n, v);
      }
    }
    return `${step.dashboardName} : ${step.panelName} : ${expr}`;
  } else {
    return `${step.sourceName}`;
  }
};

const camelCase = str => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getTSLabel = labelObj => {
  return labelObj.map(x => `${x.name}:${x.value}`).join(' | ');
};

export { formatMetricTask, getStepTitle, camelCase, getTSLabel };
