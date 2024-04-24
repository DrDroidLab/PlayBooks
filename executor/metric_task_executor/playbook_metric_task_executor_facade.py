import random
from typing import Dict

import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio

from executor.metric_task_executor.cloudwatch_task_executor import CloudwatchMetricTaskExecutor
from executor.metric_task_executor.datadog_task_executor import DatadogMetricTaskExecutor
from executor.metric_task_executor.newrelic_task_executor import NewRelicMetricTaskExecutor
from executor.metric_task_executor.playbook_metric_task_executor import PlaybookMetricTaskExecutor
from executor.metric_task_executor.grafana_executor import GrafanaMetricTaskExecutor
from executor.metric_task_executor.grafana_vpc_executor import GrafanaVpcMetricTaskExecutor

from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto, \
    PlaybookMetricTaskExecutionResult

metric_source_displace_name_map = {
    PlaybookMetricTaskDefinitionProto.Source.CLOUDWATCH: 'Cloudwatch',
    PlaybookMetricTaskDefinitionProto.Source.GRAFANA: 'Grafana',
    PlaybookMetricTaskDefinitionProto.Source.GRAFANA_VPC: 'Grafana',
    PlaybookMetricTaskDefinitionProto.Source.NEW_RELIC: 'New Relic',
    PlaybookMetricTaskDefinitionProto.Source.DATADOG: 'Datadog'
}


def generate_color_map(labels):
    color_map = {}
    for label in labels:
        color_map[label] = f'rgb({random.randint(0, 255)},{random.randint(0, 255)},{random.randint(0, 255)})'
    return color_map


def timeseries_to_df(proto_data: PlaybookMetricTaskExecutionResult.Result.Timeseries):
    data = []
    for timeseries in proto_data.labeled_metric_timeseries:
        legend_label = ''
        for label in timeseries.metric_label_values:
            legend_label += f'{label.name.value}={label.value.value}__'
        legend_label = legend_label[:-2]
        for datapoint in timeseries.datapoints:
            data.append({
                'Timestamp': pd.Timestamp(datapoint.timestamp, unit='ms').strftime('%H:%M'),
                'Value': datapoint.value.value,
                'Label': legend_label,
                'Unit': timeseries.unit.value
            })

    return pd.DataFrame(data)


def table_result_to_df(table_result):
    # Extracting column names from the first TableRow
    column_names = [col.name.value for col in table_result.rows[0].columns]

    # Initialize an empty DataFrame with column names
    df = pd.DataFrame(columns=column_names)

    # Extracting data from rows
    for row in table_result.rows:
        row_data = [col.value.value for col in row.columns]
        df = df.append(pd.Series(row_data, index=column_names), ignore_index=True)

    # Keep only the first 5 rows if there are more
    if len(df) > 5:
        df = df.head(5)

    return df


def publish_metric_task_execution_result(file_key, result):
    result_type = result.type
    if result_type == PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES:
        timeseries = result.timeseries
        df = timeseries_to_df(timeseries)
        unique_labels = df['Label'].unique()
        color_map = generate_color_map(unique_labels)
        fig = go.Figure()
        unit = df['Unit'].iloc[0] if 'Unit' in df and df['Unit'].iloc[0] else ''
        for label, data in df.groupby('Label'):
            fig.add_trace(go.Scatter(x=data['Timestamp'], y=data['Value'], mode='lines', name=label,
                                     line=dict(color=color_map[label])))
        if unique_labels is None or (len(unique_labels) == 1 and '' in unique_labels):
            fig.update_layout(
                xaxis_title='Timestamp',
                yaxis_title='Values' if not unit else unit,
                title_x=0.5,
                title_y=0.9
            )
        else:
            fig.update_layout(
                xaxis_title='Timestamp',
                yaxis_title='Values' if not unit else unit,
                legend_title_text='Labels',
                title_x=0.5,
                title_y=0.9
            )

        pio.write_image(fig, file_key)
        return True
    elif result_type == PlaybookMetricTaskExecutionResult.Result.Type.TABLE_RESULT:
        # table_result = result.table_result
        # df = table_result_to_df(table_result)
        # fig = go.Figure(data=[go.Table(
        #     header=dict(values=df.columns,
        #                 fill_color='paleturquoise',
        #                 align='left'),
        #     cells=dict(values=[df[col] for col in df.columns],
        #                fill_color='lavender',
        #                align='left'))
        # ])
        #
        # # Update layout for better visualization
        # fig.update_layout(title='Table Result' if not expression else expression, title_x=0.5, title_y=0.9)
        #
        # # Exporting the plot to an image using plotly
        # pio.write_image(fig, file_key)
        return False
    return False


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
