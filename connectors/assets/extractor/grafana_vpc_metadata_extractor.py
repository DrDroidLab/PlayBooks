import re
import time

from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.vpc_api_processor import VpcApiProcessor
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, ConnectorType


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


class GrafanaVpcConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, agent_proxy_host, agent_proxy_api_key, account_id=None, connector_id=None):
        self.__grafana_api_processor = VpcApiProcessor(agent_proxy_host, agent_proxy_api_key)
        super().__init__(account_id, connector_id, ConnectorType.GRAFANA_VPC)

    def extract_data_source(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.GRAFANA_DATASOURCE
        try:
            path = 'api/datasources'
            data_sources = self.__grafana_api_processor.v1_api_grafana(path=path)
        except Exception as e:
            print(f"Exception occurred while fetching grafana data sources with error: {e}")
            return
        if not data_sources:
            return
        model_data = {}
        for ds in data_sources:
            datasource_id = ds['uid']
            model_data[datasource_id] = ds
            if save_to_db:
                self.create_or_update_model_metadata(model_type, datasource_id, ds)
        return model_data

    def extract_dashboards(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.GRAFANA_DASHBOARD
        path = 'api/search'
        try:
            all_dashboards = self.__grafana_api_processor.v1_api_grafana(path=path)
        except Exception as e:
            print(f"Exception occurred while fetching grafana dashboards with error: {e}")
            return
        if not all_dashboards:
            return
        all_db_dashboard_uids = []
        for db in all_dashboards:
            if db['type'] == 'dash-db':
                all_db_dashboard_uids.append(db['uid'])

        model_data = {}
        for uid in all_db_dashboard_uids:
            path = "api/dashboards/uid/{}".format(uid)
            try:
                dashboard_details = self.__grafana_api_processor.v1_api_grafana(path=path)
            except Exception as e:
                print(f"Exception occurred while fetching grafana dashboard details with error: {e}")
                continue
            if not dashboard_details:
                continue
            model_data[uid] = dashboard_details
            if save_to_db:
                self.create_or_update_model_metadata(model_type, uid, dashboard_details)
        return model_data

    def extract_dashboard_target_metric_promql(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.GRAFANA_TARGET_METRIC_PROMQL
        try:
            path = 'api/datasources'
            all_data_sources = self.__grafana_api_processor.v1_api_grafana(path=path)
        except Exception as e:
            print(f"Exception occurred while fetching grafana data sources with error: {e}")
            return
        if not all_data_sources:
            return
        promql_datasources = [ds for ds in all_data_sources if ds['type'] == 'prometheus']
        try:
            path = "api/search"
            all_dashboards = self.__grafana_api_processor.v1_api_grafana(path=path)
        except Exception as e:
            print(f"Exception occurred while fetching grafana dashboards with error: {e}")
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
                path = "api/dashboards/uid/{}".format(uid)
                dashboard_details = self.__grafana_api_processor.v1_api_grafana(path=path)
            except Exception as e:
                print(f"Exception occurred while fetching grafana dashboard details with error: {e}")
                continue
            if not dashboard_details:
                continue

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

                                model_uid = f"{uid}#{p['id']}#{t['refId']}"
                                expr = t['expr'].replace('$__rate_interval', '5m')
                                expr = expr.replace('$__interval', '5m')
                                model_data[model_uid] = {'expr': expr, 'dashboard_id': uid, 'panel_id': p['id'],
                                                         'panel_title': panel_title, 'dashboard_title': dashboard_title,
                                                         'target_metric_ref_id': t['refId'],
                                                         'datasource_uid': datasource_uid}
                                if '$' in expr:
                                    metric_name = promql_get_metric_name(expr)
                                    if metric_name:
                                        model_data[model_uid]['metric_name'] = metric_name
                                        optional_label_variable_pairs = promql_get_metric_optional_label_variable_pairs(
                                            expr)
                                        path = 'api/datasources/proxy/uid/{}/api/v1/labels?match[]={}'.format(
                                            datasource_uid, metric_name)
                                        if optional_label_variable_pairs:
                                            model_data[model_uid][
                                                'optional_label_variable_pairs'] = optional_label_variable_pairs
                                            retry_attempts = 0
                                            try:
                                                response = self.__grafana_api_processor.v1_api_grafana(path=path)
                                            except Exception as e:
                                                print(
                                                    f"Exception occurred while fetching promql metric labels with error: {e}")
                                                response = None
                                            while not response and retry_attempts < 3:
                                                try:
                                                    response = self.__grafana_api_processor.v1_api_grafana(path=path)
                                                except Exception as e:
                                                    print(
                                                        f"Exception occurred while fetching promql metric labels with error: {e}")
                                                    response = None
                                                time.sleep(5)
                                                retry_attempts += 1
                                            if response and 'data' in response:
                                                promql_labels = response['data']
                                                label_value_options = {}
                                                for lb in promql_labels:
                                                    path = '{}/api/datasources/proxy/uid/{}/api/v1/label/{}/values?match[]={}'.format(
                                                        datasource_uid, lb, metric_name)
                                                    if lb in optional_label_variable_pairs:
                                                        optional_variable_name = optional_label_variable_pairs[lb]
                                                        retry_attempts = 0
                                                        try:
                                                            response = self.__grafana_api_processor.v1_api_grafana(
                                                                path=path)
                                                        except Exception as e:
                                                            print(
                                                                f"Exception occurred while fetching promql metric label values with error: {e}")
                                                            response = None
                                                        while not response and retry_attempts < 3:
                                                            try:
                                                                response = self.__grafana_api_processor.v1_api_grafana(
                                                                    path=path)
                                                            except Exception as e:
                                                                print(
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
                                    self.create_or_update_model_metadata(model_type, model_uid, model_data[model_uid])
        return model_data
