import logging
import re
import time

from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.grafana_api_processor import GrafanaApiProcessor
from protos.base_pb2 import Source, SourceModelType as SourceModelType
from utils.logging_utils import log_function_call

logger = logging.getLogger(__name__)


def promql_get_metric_name(promql):
    metric_name_end = promql.index('{')
    i = metric_name_end - 1
    while i >= 0:
        if promql[i] == ' ' or promql[i] == '(' or i == 0:
            metric_name_start = i + 1
            if i == 0:
                metric_name_start = 0
            metric_name = promql[metric_name_start:metric_name_end]
            return metric_name
        i -= 1
    return None


def promql_get_metric_optional_label_variable_pairs(promql):
    expr_label_str = promql.split('{')[1].split('}')[0]
    expr_label_str = expr_label_str.replace(' ', '')
    pattern = r'(\w+)\s*([=~]+)\s*"?(\$[\w]+)"?'
    matches = re.findall(pattern, expr_label_str)
    label_value_pairs = {label: value for label, op, value in matches}
    return label_value_pairs


class GrafanaSourceMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, grafana_host, grafana_api_key, ssl_verify="true", account_id=None, connector_id=None):
        self.__grafana_api_processor = GrafanaApiProcessor(grafana_host, grafana_api_key, ssl_verify)
        super().__init__(account_id, connector_id, Source.GRAFANA)

    @log_function_call
    def extract_data_source(self, save_to_db=False):
        model_type = SourceModelType.GRAFANA_DATASOURCE
        try:
            datasources = self.__grafana_api_processor.fetch_data_sources()
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            return
        if not datasources:
            return
        model_data = {}
        for ds in datasources:
            datasource_id = ds['uid']
            model_data[datasource_id] = ds
            if save_to_db:
                self.create_or_update_model_metadata(model_type, datasource_id, ds)
        return model_data

    @log_function_call
    def extract_prometheus_data_source(self, save_to_db=False):
        model_type = SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE
        try:
            all_data_sources = self.__grafana_api_processor.fetch_data_sources()
            all_promql_data_sources = [ds for ds in all_data_sources if ds['type'] == 'prometheus']
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            return
        if not all_promql_data_sources:
            return
        model_data = {}
        for ds in all_promql_data_sources:
            datasource_id = ds['uid']
            model_data[datasource_id] = ds
            if save_to_db:
                self.create_or_update_model_metadata(model_type, datasource_id, ds)
        return model_data

    @log_function_call
    def extract_dashboards(self, save_to_db=False):
        model_type = SourceModelType.GRAFANA_DASHBOARD
        try:
            all_dashboards = self.__grafana_api_processor.fetch_dashboards()
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana dashboards with error: {e}")
            return
        if not all_dashboards:
            return
        all_db_dashboard_uids = []
        for db in all_dashboards:
            if db['type'] == 'dash-db':
                all_db_dashboard_uids.append(db['uid'])

        model_data = {}
        for uid in all_db_dashboard_uids:
            try:
                dashboard_details = self.__grafana_api_processor.fetch_dashboard_details(uid)
            except Exception as e:
                logger.error(f"Exception occurred while fetching grafana dashboard details with error: {e}")
                continue
            if not dashboard_details:
                continue
            model_data[uid] = dashboard_details
            if save_to_db:
                self.create_or_update_model_metadata(model_type, uid, dashboard_details)
        return model_data

    @log_function_call
    def extract_dashboard_target_metric_promql(self, save_to_db=False):
        model_type = SourceModelType.GRAFANA_TARGET_METRIC_PROMQL
        try:
            all_data_sources = self.__grafana_api_processor.fetch_data_sources()
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            return
        if not all_data_sources:
            return
        promql_datasources = [ds for ds in all_data_sources if ds['type'] == 'prometheus']
        try:
            all_dashboards = self.__grafana_api_processor.fetch_dashboards()
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana dashboards with error: {e}")
            return
        if not all_dashboards:
            return
        all_db_dashboard_uids = []
        for db in all_dashboards:
            if db['type'] == 'dash-db':
                all_db_dashboard_uids.append(db['uid'])

        model_data = {}
        for uid in all_db_dashboard_uids:
            try:
                dashboard_details = self.__grafana_api_processor.fetch_dashboard_details(uid)
            except Exception as e:
                logger.error(f"Exception occurred while fetching grafana dashboard details with error: {e}")
                continue
            if not dashboard_details:
                continue
            try:
                if 'dashboard' in dashboard_details and 'panels' in dashboard_details['dashboard']:
                    dashboard_title = ''
                    if 'title' in dashboard_details['dashboard']:
                        dashboard_title = dashboard_details['dashboard']['title']
                    panels = dashboard_details['dashboard']['panels']
                    for p in panels:
                        panel_title = ''
                        if 'title' in p:
                            panel_title = p['title']
                        if 'targets' in p:
                            targets = p['targets']
                            for t in targets:
                                if 'expr' in t:
                                    # datasource = p['datasource']
                                    # datasource_uid = None
                                    # if isinstance(datasource, dict):
                                    #     datasource_uid = datasource['uid']
                                    # else:
                                    #     for promql_datasource in promql_datasources:
                                    #         if promql_datasource['typeName'] == datasource:
                                    #             datasource_uid = promql_datasource['uid']
                                    #             break
                                    # if not datasource_uid:
                                    #     datasource_uid = promql_datasources[0]['uid']
                                    # TODO(MG): Check how to remove data source hard coding
                                    datasource_uid = promql_datasources[0]['uid']

                                    model_uid = f"{uid}#{p['id']}#{t.get('refId', 'A')}"
                                    expr = t['expr'].replace('$__rate_interval', '5m')
                                    expr = expr.replace('$__interval', '5m')
                                    model_data[model_uid] = {'expr': expr, 'dashboard_id': uid, 'panel_id': p['id'],
                                                             'panel_title': panel_title,
                                                             'dashboard_title': dashboard_title,
                                                             'target_metric_ref_id': t.get('refId', 'A'),
                                                             'datasource_uid': datasource_uid}
                                    if '$' in expr:
                                        metric_name = promql_get_metric_name(expr)
                                        if metric_name:
                                            model_data[model_uid]['metric_name'] = metric_name
                                            optional_label_variable_pairs = promql_get_metric_optional_label_variable_pairs(
                                                expr)
                                            if optional_label_variable_pairs:
                                                model_data[model_uid][
                                                    'optional_label_variable_pairs'] = optional_label_variable_pairs
                                                retry_attempts = 0
                                                try:
                                                    response = self.__grafana_api_processor.fetch_promql_metric_labels(
                                                        datasource_uid, metric_name)
                                                except Exception as e:
                                                    logger.error(
                                                        f"Exception occurred while fetching promql metric labels with error: {e}")
                                                    response = None
                                                while not response and retry_attempts < 3:
                                                    try:
                                                        response = self.__grafana_api_processor.fetch_promql_metric_labels(
                                                            datasource_uid, metric_name)
                                                    except Exception as e:
                                                        logger.error(
                                                            f"Exception occurred while fetching promql metric labels with error: {e}")
                                                        response = None
                                                    time.sleep(5)
                                                    retry_attempts += 1
                                                if response and 'data' in response:
                                                    promql_labels = response['data']
                                                    label_value_options = {}
                                                    for lb in promql_labels:
                                                        if lb in optional_label_variable_pairs:
                                                            optional_variable_name = optional_label_variable_pairs[lb]
                                                            retry_attempts = 0
                                                            try:
                                                                response = self.__grafana_api_processor.fetch_promql_metric_label_values(
                                                                    datasource_uid, metric_name, lb)
                                                            except Exception as e:
                                                                logger.error(
                                                                    f"Exception occurred while fetching promql metric label values with error: {e}")
                                                                response = None
                                                            while not response and retry_attempts < 3:
                                                                try:
                                                                    response = self.__grafana_api_processor.fetch_promql_metric_label_values(
                                                                        datasource_uid, metric_name)
                                                                except Exception as e:
                                                                    logger.error(
                                                                        f"Exception occurred while fetching promql metric label values with error: {e}")
                                                                    response = None
                                                                time.sleep(5)
                                                                retry_attempts += 1
                                                            if response and 'data' in response:
                                                                label_values = response['data']
                                                                label_value_options[
                                                                    optional_variable_name] = label_values
                                                    if label_value_options:
                                                        model_data[model_uid][
                                                            'optional_label_options'] = label_value_options
                                    if save_to_db:
                                        self.create_or_update_model_metadata(model_type, model_uid,
                                                                             model_data[model_uid])
                if 'dashboard' in dashboard_details and 'rows' in dashboard_details['dashboard']:
                    rows = dashboard_details['dashboard']['rows']
                    for r in rows:
                        if 'panels' in r:
                            panels = r['panels']
                            dashboard_title = ''
                            if 'title' in dashboard_details['dashboard']:
                                dashboard_title = dashboard_details['dashboard']['title']
                            for p in panels:
                                panel_title = ''
                                if 'title' in p:
                                    panel_title = p['title']
                                if 'targets' in p:
                                    targets = p['targets']
                                    for t in targets:
                                        if 'expr' in t:
                                            # datasource = p['datasource']
                                            # datasource_uid = None
                                            # if isinstance(datasource, dict):
                                            #     datasource_uid = datasource['uid']
                                            # else:
                                            #     for promql_datasource in promql_datasources:
                                            #         if promql_datasource['typeName'] == datasource:
                                            #             datasource_uid = promql_datasource['uid']
                                            #             break
                                            # if not datasource_uid:
                                            #     datasource_uid = promql_datasources[0]['uid']
                                            # TODO(MG): Check how to remove data source hard coding
                                            datasource_uid = promql_datasources[0]['uid']

                                            model_uid = f"{uid}#{p['id']}#{t.get('refId', 'A')}"
                                            expr = t['expr'].replace('$__rate_interval', '5m')
                                            expr = expr.replace('$__interval', '5m')
                                            model_data[model_uid] = {'expr': expr, 'dashboard_id': uid,
                                                                     'panel_id': p['id'],
                                                                     'panel_title': panel_title,
                                                                     'dashboard_title': dashboard_title,
                                                                     'target_metric_ref_id': t.get('refId', 'A'),
                                                                     'datasource_uid': datasource_uid}
                                            if '$' in expr:
                                                metric_name = promql_get_metric_name(expr)
                                                if metric_name:
                                                    model_data[model_uid]['metric_name'] = metric_name
                                                    optional_label_variable_pairs = promql_get_metric_optional_label_variable_pairs(
                                                        expr)
                                                    if optional_label_variable_pairs:
                                                        model_data[model_uid][
                                                            'optional_label_variable_pairs'] = optional_label_variable_pairs
                                                        retry_attempts = 0
                                                        try:
                                                            response = self.__grafana_api_processor.fetch_promql_metric_labels(
                                                                datasource_uid, metric_name)
                                                        except Exception as e:
                                                            logger.error(
                                                                f"Exception occurred while fetching promql metric labels with error: {e}")
                                                            response = None
                                                        while not response and retry_attempts < 3:
                                                            try:
                                                                response = self.__grafana_api_processor.fetch_promql_metric_labels(
                                                                    datasource_uid, metric_name)
                                                            except Exception as e:
                                                                logger.error(
                                                                    f"Exception occurred while fetching promql metric labels with error: {e}")
                                                                response = None
                                                            time.sleep(5)
                                                            retry_attempts += 1
                                                        if response and 'data' in response:
                                                            promql_labels = response['data']
                                                            label_value_options = {}
                                                            for lb in promql_labels:
                                                                if lb in optional_label_variable_pairs:
                                                                    optional_variable_name = \
                                                                        optional_label_variable_pairs[lb]
                                                                    retry_attempts = 0
                                                                    try:
                                                                        response = self.__grafana_api_processor.fetch_promql_metric_label_values(
                                                                            datasource_uid, metric_name, lb)
                                                                    except Exception as e:
                                                                        logger.error(
                                                                            f"Exception occurred while fetching promql metric label values with error: {e}")
                                                                        response = None
                                                                    while not response and retry_attempts < 3:
                                                                        try:
                                                                            response = self.__grafana_api_processor.fetch_promql_metric_label_values(
                                                                                datasource_uid, metric_name)
                                                                        except Exception as e:
                                                                            logger.error(
                                                                                f"Exception occurred while fetching promql metric label values with error: {e}")
                                                                            response = None
                                                                        time.sleep(5)
                                                                        retry_attempts += 1
                                                                    if response and 'data' in response:
                                                                        label_values = response['data']
                                                                        label_value_options[
                                                                            optional_variable_name] = label_values
                                                            if label_value_options:
                                                                model_data[model_uid][
                                                                    'optional_label_options'] = label_value_options
                                            if save_to_db:
                                                self.create_or_update_model_metadata(model_type, model_uid,
                                                                                     model_data[model_uid])
                if 'dashboard' in dashboard_details and 'panels' in dashboard_details['dashboard']:
                    panels = dashboard_details['dashboard']['panels']
                    for p in panels:
                        if 'panels' in p:
                            panels = p['panels']
                            dashboard_title = ''
                            if 'title' in dashboard_details['dashboard']:
                                dashboard_title = dashboard_details['dashboard']['title']
                            for p in panels:
                                panel_title = ''
                                if 'title' in p:
                                    panel_title = p['title']
                                if 'targets' in p:
                                    targets = p['targets']
                                    for t in targets:
                                        if 'expr' in t:
                                            # datasource = p['datasource']
                                            # datasource_uid = None
                                            # if isinstance(datasource, dict):
                                            #     datasource_uid = datasource['uid']
                                            # else:
                                            #     for promql_datasource in promql_datasources:
                                            #         if promql_datasource['typeName'] == datasource:
                                            #             datasource_uid = promql_datasource['uid']
                                            #             break
                                            # if not datasource_uid:
                                            #     datasource_uid = promql_datasources[0]['uid']
                                            # TODO(MG): Check how to remove data source hard coding
                                            datasource_uid = promql_datasources[0]['uid']

                                            model_uid = f"{uid}#{p['id']}#{t.get('refId', 'A')}"
                                            expr = t['expr'].replace('$__rate_interval', '5m')
                                            expr = expr.replace('$__interval', '5m')
                                            model_data[model_uid] = {'expr': expr, 'dashboard_id': uid,
                                                                     'panel_id': p['id'],
                                                                     'panel_title': panel_title,
                                                                     'dashboard_title': dashboard_title,
                                                                     'target_metric_ref_id': t.get('refId', 'A'),
                                                                     'datasource_uid': datasource_uid}
                                            if '$' in expr:
                                                metric_name = promql_get_metric_name(expr)
                                                if metric_name:
                                                    model_data[model_uid]['metric_name'] = metric_name
                                                    optional_label_variable_pairs = promql_get_metric_optional_label_variable_pairs(
                                                        expr)
                                                    if optional_label_variable_pairs:
                                                        model_data[model_uid][
                                                            'optional_label_variable_pairs'] = optional_label_variable_pairs
                                                        retry_attempts = 0
                                                        try:
                                                            response = self.__grafana_api_processor.fetch_promql_metric_labels(
                                                                datasource_uid, metric_name)
                                                        except Exception as e:
                                                            logger.error(
                                                                f"Exception occurred while fetching promql metric labels with error: {e}")
                                                            response = None
                                                        while not response and retry_attempts < 3:
                                                            try:
                                                                response = self.__grafana_api_processor.fetch_promql_metric_labels(
                                                                    datasource_uid, metric_name)
                                                            except Exception as e:
                                                                logger.error(
                                                                    f"Exception occurred while fetching promql metric labels with error: {e}")
                                                                response = None
                                                            time.sleep(5)
                                                            retry_attempts += 1
                                                        if response and 'data' in response:
                                                            promql_labels = response['data']
                                                            label_value_options = {}
                                                            for lb in promql_labels:
                                                                if lb in optional_label_variable_pairs:
                                                                    optional_variable_name = \
                                                                        optional_label_variable_pairs[lb]
                                                                    retry_attempts = 0
                                                                    try:
                                                                        response = self.__grafana_api_processor.fetch_promql_metric_label_values(
                                                                            datasource_uid, metric_name, lb)
                                                                    except Exception as e:
                                                                        logger.error(
                                                                            f"Exception occurred while fetching promql metric label values with error: {e}")
                                                                        response = None
                                                                    while not response and retry_attempts < 3:
                                                                        try:
                                                                            response = self.__grafana_api_processor.fetch_promql_metric_label_values(
                                                                                datasource_uid, metric_name)
                                                                        except Exception as e:
                                                                            logger.error(
                                                                                f"Exception occurred while fetching promql metric label values with error: {e}")
                                                                            response = None
                                                                        time.sleep(5)
                                                                        retry_attempts += 1
                                                                    if response and 'data' in response:
                                                                        label_values = response['data']
                                                                        label_value_options[
                                                                            optional_variable_name] = label_values
                                                            if label_value_options:
                                                                model_data[model_uid][
                                                                    'optional_label_options'] = label_value_options
                                            if save_to_db:
                                                self.create_or_update_model_metadata(model_type, model_uid,
                                                                                     model_data[model_uid])
            except Exception as e:
                logger.error(
                    f"Exception occurred while processing dashboard details with error: {e}, {e.__traceback__}")
        return model_data
