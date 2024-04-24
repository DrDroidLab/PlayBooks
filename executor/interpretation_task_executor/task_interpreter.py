#todo -- add comparisons with previous time windows
#todo -- compare multiple timeseries data in one go
#todo -- add more statistical models for timeseries metrics
#todo -- add models for logs, db_query, deployments, container_logs


import os
import json
import requests
import pandas as pd

import boto3
from io import BytesIO
from pyecharts.charts import Line
import pyecharts.options as opts
from pyecharts.render import make_snapshot
from adtk.data import validate_series
from adtk.visualization import plot
from adtk.detector import QuantileAD, PersistAD, LevelShiftAD, VolatilityShiftAD

import time
from snapshot_selenium import snapshot as driver

public_bucket_name = os.environ['PUBLIC_BUCKET_NAME']
AWS_ACCESS_KEY = os.environ['AWS_ACCESS_KEY']
AWS_SECRET_KEY = os.environ['AWS_SECRET_KEY']
open_ai_key = os.environ['OPENAI_API_KEY']

def get_schema(d, schema=None, path=''):
    if schema is None:
        schema = {}

    for key, value in d.items():
        key_path = f"{path}.{key}" if path else key

        if isinstance(value, dict):
            get_schema(value, schema, key_path)
        elif isinstance(value, list):
            # Handle lists: assume all items in the list are of the same type as the first item
            list_type = type(value[0]).__name__
            if value and isinstance(value[0], dict):
                # If it's a list of dictionaries, recurse into the dictionary
                schema[key_path] = f"List of {list_type}"
                example_item = value[0]
                get_schema(example_item, schema, key_path)
            else:
                # Simple list of basic data types
                schema[key_path] = f"List of {list_type}"
        else:
            schema[key_path] = type(value).__name__
    return schema


def transform_playbook_task_result_to_dataframe(playbook_task):
    ## Extract data from the Playbook Response.
    try:
        table_df = pd.DataFrame()
        #'step_number','step_description','anomaly_detected','related_images','description'
        rows = []
        if 'metric_task_execution_result' in playbook_task:
            step_description = playbook_task['metric_task_execution_result']['metric_source'] + " " + playbook_task['metric_task_execution_result']['result']['type']
            if playbook_task['metric_task_execution_result']['result']['type'] == 'TIMESERIES':
                metric_result = playbook_task['metric_task_execution_result']['result']['timeseries']
                if 'labeled_metric_timeseries' in metric_result:
                    metric_result = metric_result['labeled_metric_timeseries']
                    for series in metric_result:
                        # Build the name from all label-value pairs in metric_label_values
                        if 'metric_label_values' in series:
                            metric_name = ' '.join([f"{label['name']} {label['value']}" for label in series['metric_label_values']])
                        else:
                            metric_name = playbook_task['metric_task_execution_result']['metric_name']+" " + playbook_task['metric_task_execution_result']['metric_expression']
                        # Loop through each datapoint and use the constructed name
                        for datapoint in series['datapoints']:
                            timestamp = datapoint['timestamp']
                            value = datapoint['value']
                            rows.append({'name': metric_name, 'timestamp': timestamp, 'value': value})
                    table_df = pd.DataFrame(rows, columns=['name', 'timestamp', 'value'])
            elif playbook_task['metric_task_execution_result']['result']['type'] == 'TABLE_RESULT':
                table_result = playbook_task['metric_task_execution_result']['result']['table_result']['rows']
                table_df_row = pd.DataFrame()
                for row in table_result:
                    temp_data = row['columns']
                    temp_dict = {}
                    for data in temp_data:
                        temp_dict[data['name']] = data['value']
                    table_df_row = pd.DataFrame([temp_dict])
                table_df = pd.concat([table_df, table_df_row], axis=0)
            else:
                print("no data")
        elif 'data_fetch_task_execution_result' in playbook_task:
            step_description = playbook_task['data_fetch_task_execution_result']['data_source'] + " " + playbook_task['data_fetch_task_execution_result']['result']['type']
            if playbook_task['data_fetch_task_execution_result']['result']['type'] == 'TABLE_RESULT':
                data_result = playbook_task['data_fetch_task_execution_result']['result']['table_result']['rows']
                table_df_row = pd.DataFrame()
                for row in data_result:
                    temp_data = row['columns']
                    temp_dict = {}
                    for data in temp_data:
                        temp_dict[data['name']] = data['value']
                    table_df_row = pd.DataFrame([temp_dict])
                table_df = pd.concat([table_df, table_df_row], axis=0)
        return table_df
    except Exception as e:
        print(e)
        schema = get_schema(playbook_task)
        print(schema)
        return None


def save_to_s3(file_name):
  with open(file_name, 'rb') as f:
    image_buffer = BytesIO(f.read())
  s3 = boto3.client('s3', region_name='us-west-2', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
  s3.upload_fileobj(image_buffer, public_bucket_name, file_name, ExtraArgs={'Tagging': 'public=yes'})
  image_url = f"https://{public_bucket_name}.s3.us-west-2.amazonaws.com/{file_name}"
  return image_url


def generate_graph_using_data(df, file_name):
    line_chart = Line(init_opts=opts.InitOpts(bg_color="#fafafa"))
    line_chart.add_xaxis(df['timestamp'].tolist())
    line_chart.add_yaxis("Value", df['value'].tolist())

    # Set chart title and axis labels
    line_chart.set_global_opts(
                               title_opts=opts.TitleOpts(title="Graph"),
                            xaxis_opts=opts.AxisOpts(name="Timestamp"),
                            yaxis_opts=opts.AxisOpts(name="Value"))
    # Render the chart
    line_chart.render('render.html')
    make_snapshot(driver, 'render.html', file_name)
    # # Save the .png file to S3 bucket
    image_url = save_to_s3(file_name)
    return image_url


def evaluation_functions(mode,data_type,df):

    def identify_spikes_and_drops(df):
        data = validate_series(df['value'])

        # Define a detector for spikes and drops using quantiles
        quantile_ad = QuantileAD(high=0.99, low=0.01)  # Adjust thresholds as needed
        # Detect spikes & drops anomalies
        spikes_and_drops = quantile_ad.fit_detect(data)
        df['spike_or_drop'] = spikes_and_drops.reindex(df.index).fillna(0).astype(int)  # Handle any index misalignment
        # try:
        #   plot(data, anomaly=spikes_and_drops, ts_linewidth=1, ts_markersize=3, anomaly_markersize=5, anomaly_color='red', anomaly_tag="marker");
        # except Exception as e:
        #   print(e)
        return df

    def identify_step_jump(df):
        data = validate_series(df['value'])

        # Define a detector for spikes and drops using quantiles
        # Define a detector for step changes
        persist_ad = PersistAD(side='positive', c=1.5)  # Adjust parameters based on your specific time window and sensitivity
        # Detect step change anomalies
        step_changes = persist_ad.fit_detect(data).fillna(False)
        df['step_change'] = step_changes.reindex(df.index).fillna(0).astype(int)  # Handle any index misalignment
        # try:
        #   plot(data, anomaly=step_changes, ts_linewidth=1, ts_markersize=3, anomaly_color='red')
        # except Exception as e:
        #   raise e
        return df

    def identify_level_shift(df):
        data = validate_series(df['value'])

        # Define a detector for LevelShift
        level_shift_ad = LevelShiftAD(c=6.0, side='both', window=5)
        level_shift = level_shift_ad.fit_detect(data)
        df['level_shift'] = level_shift.reindex(df.index).fillna(0).astype(int)  # Handle any index misalignment
        # try:
        #   plot(data, anomaly=level_shift, anomaly_color='red');
        # except Exception as e:
        #   raise e
        return df

    def identify_volatility_shift(df):
        data = validate_series(df['value'])
        # Define a detector for volatility shift
        # Define a detector for step changes
        volatility_shift_ad = VolatilityShiftAD(c=6.0, side='positive', window=30)
        volatility_shift = volatility_shift_ad.fit_detect(data)
        df['volatility_shift'] = volatility_shift.reindex(df.index).fillna(0).astype(int)  # Handle any index misalignment
        # try:
        #   plot(data, anomaly=volatility_shift, anomaly_color='red');
        # except Exception as e:
        #   raise e
        return df

    def gpt__metric_inference(image_url):
        keys = """
        anomaly_detected:boolean
        description:string
        """

        system_prompt = """You are a DevOps engineer who is an expert at reading metrics graphs. These metrics are generated by tools and services that you use to deploy and monitor your applications or services.
        You are responsible for reading the metrics and detecting if there is any anomaly here.

        You will be given an image of the metrics data. You will need to return a JSON object with the following keys:

        {keys}
        """.format(keys=keys)

        prompt = [
            {"type": "text",
             "text": "This image is of  and identify if you find any anomaly. If you do, describe the issue. Only send the keys that are requested. Do not send more keys or keys with empty or N/A values. Strictly donot repond with empty strings or N/A or 'No Data' as  key values."},
            {
                "type": "image_url",
                "image_url": {
                    "url": image_url,
                },
            },
        ]

        from openai import OpenAI
        client = OpenAI()

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        )

        print(response.choices[0])
        print(response.choices[0].message.content)

        return response.choices[0].message.content

    inference_df = {}
    if data_type == 'metric':
        if(mode == 'statistical'):
        # run loop over graphs
            # run loop over lines
            df = identify_spikes_and_drops(df)
            df = identify_step_jump(df)
            df = identify_level_shift(df)
            df = identify_volatility_shift(df)
            return df
        elif(mode == 'gpt_vision'):
            current_time_in_epoch = int(time.time())
            image_url = generate_graph_using_data(df, f"graph_{current_time_in_epoch}.png")
            gpt_response = json.loads(gpt__metric_inference(image_url))
            inference_df = {'anomaly_detected':gpt_response['anomaly_detected'],'description':gpt_response['description'],'additional_data':{'image':image_url}}

    elif data_type == 'logs':
        inference_df = pd.DataFrame(columns = ['anomaly_detected','description','additional_data'])

    elif data_type == 'db_query':
        inference_df = pd.DataFrame(columns = ['anomaly_detected','description','additional_data'])

    elif data_type == 'deployments':
        inference_df = pd.DataFrame(columns = ['anomaly_detected','description','additional_data'])

    elif data_type == 'container_logs':
        inference_df = pd.DataFrame(columns = ['anomaly_detected','description','additional_data'])

    return inference_df

def evaluate_task(task_json,mode):
    task_df = transform_playbook_task_result_to_dataframe(task_json)
    mode = 'gpt_vision' #options = statistical, gpt_vision
    if 'metric_task_execution_result' in task_json:
        if task_json['metric_task_execution_result']['result']['type'] == 'TIMESERIES':
            data_type = 'metric'
        elif task_json['metric_task_execution_result']['result']['type'] == 'TABLE_RESULT':
            data_type = 'logs'
    elif 'data_fetch_task_execution_result' in task_json:
        data_type = 'db_query'
    evaluation_result = evaluate_task(mode,data_type,task_df)
    print(task_df)
    print(evaluation_result)
