import os
import random

import logging

import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio
import math

from media.utils import save_image_to_db, save_csv_to_db, save_text_to_db
from protos.playbooks.playbook_commons_pb2 import TimeseriesResult, TableResult

logger = logging.getLogger(__name__)


def generate_color_map(labels):
    color_map = {}
    for label in labels:
        color_map[label] = f'rgb({random.randint(0, 255)},{random.randint(0, 255)},{random.randint(0, 255)})'
    return color_map


def timeseries_result_to_df(result: TimeseriesResult):
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


def table_result_to_df(table_result):
    data = []
    for row in table_result.rows:
        columns = row.columns
        data.append({col.name.value: col.value.value for col in columns})

    return pd.DataFrame(data)


def generate_graph_for_timeseries_result(timeseries: TimeseriesResult, file_key, image_title='Untitled') -> str:
    max_items_per_row = 5
    df = timeseries_result_to_df(timeseries)
    if df.empty:
        return ''
    unique_labels = df['Label'].unique()
    color_map = generate_color_map(unique_labels)
    fig = go.Figure()
    unit = df['Unit'].iloc[0] if 'Unit' in df and df['Unit'].iloc[0] else ''

    for label_val in unique_labels:
        data = df[df['Label'] == label_val].sort_values(by='Timestamp')
        fig.add_trace(go.Scatter(x=data['Timestamp'], y=data['Value'], mode='lines', name=label_val,
                                 line=dict(color=color_map[label_val])))

    num_legend_rows = math.ceil(len(unique_labels) / max_items_per_row)

    base_height = 400
    extra_height_per_row = 100
    total_height = base_height + (num_legend_rows * extra_height_per_row)

    # Calculate y position for the legend based on the number of legend rows
    legend_y = -0.05 * num_legend_rows if num_legend_rows > 10 else -0.1 * num_legend_rows

    fig.update_layout(
        title={'text': image_title, 'x': 0.5, 'y': 0.95},
        xaxis_title='Timestamp',
        yaxis_title='Values' if not unit else unit,
        legend=dict(
            x=0.5,
            y=legend_y,
            orientation='h',
            bordercolor='Black',
            borderwidth=1,
            tracegroupgap=5,
            xanchor='center',
            yanchor='top',
            font=dict(
                size=12
            ),
            itemsizing='constant'
        ),
        width=800,
        height=total_height
    )

    try:
        pio.write_image(fig, file_key)
        object_url = save_image_to_db(file_key, image_title)
        return object_url
    except Exception as e:
        logger.error(f'Error generating graph using metric timeseries data: {e}')
        raise e


def generate_csv_for_table_result(table: TableResult, csv_file_path, csv_file_title='Untitled') -> (str, str):
    df = table_result_to_df(table)
    df.to_csv(csv_file_path, index=False)
    if df.empty:
        return '', ''
    try:
        object_uid, object_url = save_csv_to_db(csv_file_path, csv_file_title)
        return object_uid, object_url
    except Exception as e:
        logger.error(f'Error generating graph using metric timeseries data: {e}')
        raise e


def generate_txt_for_bash_result(text_content, text_file_path, text_file_title='Untitled') -> (str, str):
    try:
        with open(text_file_path, 'w+') as text_file:
            text_file.write(text_content)
        object_uid, object_url = save_text_to_db(text_file_path, text_file_title)
        return object_uid, object_url
    except Exception as e:
        logger.error(f'Error generating graph using metric timeseries data: {e}')
        raise e
