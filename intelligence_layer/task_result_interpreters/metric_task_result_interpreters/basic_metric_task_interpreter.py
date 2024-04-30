import logging

import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio
from google.protobuf.wrappers_pb2 import StringValue

from intelligence_layer.utils import generate_color_map
from media.utils import save_image_to_db, generate_local_image_path
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.playbook_pb2 import PlaybookMetricTaskExecutionResult as PlaybookMetricTaskExecutionResultProto, \
    PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto, \
    PlaybookTaskDefinition as PlaybookTaskDefinitionProto

logger = logging.getLogger(__name__)

metric_source_displace_name_map = {
    PlaybookMetricTaskDefinitionProto.Source.CLOUDWATCH: 'Cloudwatch',
    PlaybookMetricTaskDefinitionProto.Source.GRAFANA: 'Grafana',
    PlaybookMetricTaskDefinitionProto.Source.GRAFANA_VPC: 'Grafana',
    PlaybookMetricTaskDefinitionProto.Source.NEW_RELIC: 'New Relic',
    PlaybookMetricTaskDefinitionProto.Source.DATADOG: 'Datadog'
}


def metric_timeseries_result_to_df(result: PlaybookMetricTaskExecutionResultProto.Result.Timeseries):
    data = []
    for timeseries in result.labeled_metric_timeseries:
        legend_label = ''
        for label in timeseries.metric_label_values:
            legend_label += f'{label.name.value}={label.value.value}__'
        if legend_label and legend_label[-2:] == '__':
            legend_label = legend_label[:-2]
        for datapoint in timeseries.datapoints:
            data.append({
                'Timestamp': pd.Timestamp(datapoint.timestamp, unit='ms').strftime('%H:%M'),
                'Value': datapoint.value.value,
                'Label': legend_label,
                'Unit': timeseries.unit.value
            })

    return pd.DataFrame(data)


def table_result_to_df(table_result, task_name='Data Fetch Task'):
    data = []
    for row in table_result.rows:
        columns = row.columns
        data.append({col.name.value: col.value for col in columns})

    return pd.DataFrame(data)


def metric_table_result_to_df(table_result):
    column_names = [col.name.value for col in table_result.rows[0].columns]

    df = pd.DataFrame(columns=column_names)

    for row in table_result.rows:
        row_data = [col.value.value for col in row.columns]
        df = df.append(pd.Series(row_data, index=column_names), ignore_index=True)

    if len(df) > 5:
        df = df.head(5)

    return df


def basic_metric_task_result_interpreter(task: PlaybookTaskDefinitionProto,
                                         task_result: PlaybookMetricTaskExecutionResultProto) -> InterpretationProto:
    file_key = generate_local_image_path()
    metric_expression = task_result.metric_expression.value
    metric_expression = metric_expression.replace('`', '')
    metric_name = task_result.metric_name.value
    metric_source = metric_source_displace_name_map.get(task_result.metric_source)
    result = task_result.result
    result_type = result.type
    if result_type == PlaybookMetricTaskExecutionResultProto.Result.Type.TIMESERIES:
        timeseries = result.timeseries
        df = metric_timeseries_result_to_df(timeseries)
        unique_labels = df['Label'].unique()
        color_map = generate_color_map(unique_labels)
        fig = go.Figure()
        unit = df['Unit'].iloc[0] if 'Unit' in df and df['Unit'].iloc[0] else ''
        for label_val in df['Label'].unique():
            data = df[df['Label'] == label_val].sort_values(by='Timestamp')
            fig.add_trace(go.Scatter(x=data['Timestamp'], y=data['Value'], mode='lines', name=label_val,
                                     line=dict(color=color_map[label_val])))
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
        try:
            pio.write_image(fig, file_key)
            object_url = save_image_to_db(file_key, task.name.value, remove_file_from_os=True)
            if metric_name:
                metric_name = metric_name.replace('`', '')
                title = f'Fetched `{metric_expression}` for `{metric_name}` from `{metric_source}`'
            else:
                title = f'Fetched `{metric_expression}` from `{metric_source}`'
            return InterpretationProto(
                type=InterpretationProto.Type.IMAGE,
                title=StringValue(value=title),
                image_url=StringValue(value=object_url),
            )
        except Exception as e:
            logger.error(f'Error writing image: {e}')
            raise e
    elif result_type == PlaybookMetricTaskExecutionResultProto.Result.Type.TABLE_RESULT:
        try:
            table_result: PlaybookMetricTaskExecutionResultProto.Result.TableResult = result.table_result
            df = table_result_to_df(table_result, metric_name)
            df.to_csv(file_key, index=False)
            title = f'Fetched `{metric_expression.value}` from `{metric_source}`.'
            return InterpretationProto(
                type=InterpretationProto.Type.CSV_FILE,
                title=StringValue(value=title),
                file_path=StringValue(value=file_key),
            )
        except Exception as e:
            logger.error(f'Error interpreting data fetch task result: {e}')
            raise e
    else:
        logger.error(f'Unsupported result type: {result_type}')
        raise NotImplementedError(f'Unsupported result type: {result_type}')
