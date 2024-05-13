from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.datadog_api_processor import DatadogApiProcessor
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class DatadogConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, dd_app_key, dd_api_key, dd_api_domain='datadoghq.com', dd_connector_type=None, account_id=None,
                 connector_id=None):
        self.__dd_api_processor = DatadogApiProcessor(dd_app_key, dd_api_key, dd_api_domain, dd_connector_type)

        super().__init__(account_id, connector_id, ConnectorType.DATADOG)

    def extract_services(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_SERVICE
        model_data = {}
        prod_env_tags = ['prod', 'production']
        for tag in prod_env_tags:
            try:
                services = self.__dd_api_processor.fetch_service_map(tag)
            except Exception as e:
                print(f'Error fetching services for tag: {tag} - {e}')
                continue
            if not services:
                continue
            for service, metadata in services.items():
                service_metadata = model_data.get(service, {})
                service_metadata[tag] = metadata
                model_data[service] = service_metadata
        try:
            all_metrics = self.__dd_api_processor.fetch_metrics().get('data', [])
        except Exception as e:
            print(f'Error fetching metrics: {e}')
            all_metrics = []
        if not all_metrics:
            return model_data
        service_metric_map = {}
        for mt in all_metrics:
            try:
                tags = self.__dd_api_processor.fetch_metric_tags(mt['id']).get('data', {}).get('attributes', {}).get(
                    'tags', [])
            except Exception as e:
                print(f'Error fetching metric tags for metric: {mt["id"]} - {e}')
                tags = []
            family = mt['id'].split('.')[0]
            for tag in tags:
                if tag.startswith('service:'):
                    service = tag.split(':')[1]
                    print(f'service: {service}')
                    metrics = service_metric_map.get(service, [])
                    essential_tags = [tag for tag in tags if tag.startswith('env:') or tag.startswith('service:')]
                    metrics.append({'id': mt['id'], 'type': mt['type'], 'family': family, 'tags': essential_tags})
                    service_metric_map[service] = metrics
        for service, metrics in service_metric_map.items():
            service_model_data = model_data.get(service, {})
            service_model_data['metrics'] = metrics
            model_data[service] = service_model_data
        for service, metadata in model_data.items():
            if save_to_db:
                self.create_or_update_model_metadata(model_type, service, metadata)
        return model_data

    def extract_monitor(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_MONITOR
        model_data = {}
        try:
            monitors = self.__dd_api_processor.fetch_monitors()
            if not monitors or len(monitors) == 0:
                return model_data
            for monitor in monitors:
                monitor_dict = monitor.to_dict()
                monitor_id = str(monitor_dict['id'])
                model_data[monitor_id] = monitor_dict
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, monitor_id, monitor_dict)
        except Exception as e:
            print(f'Error extracting monitors: {e}')
        return model_data

    def extract_dashboard(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_DASHBOARD
        model_data = {}
        try:
            response = self.__dd_api_processor.fetch_dashboards()
            if not response or 'dashboards' not in response:
                return model_data
            dashboards = response['dashboards']
            dashboard_ids = [dashboard['id'] for dashboard in dashboards]
            for dashboard_id in dashboard_ids:
                try:
                    dashboard = self.__dd_api_processor.fetch_dashboard_details(dashboard_id)
                except Exception as e:
                    print(f'Error fetching dashboard details for dashboard_id: {dashboard_id} - {e}')
                    continue
                if not dashboard:
                    continue
                dashboard_id = str(dashboard['id'])
                model_data[dashboard_id] = dashboard
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, dashboard_id, dashboard)
        except Exception as e:
            print(f'Error extracting dashboards: {e}')
        return model_data

    def extract_active_aws_integrations(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_LIVE_INTEGRATION_AWS
        model_data = {}
        try:
            response = self.__dd_api_processor.fetch_aws_integrations()
            if not response or 'accounts' not in response:
                return model_data
            aws_accounts = response['accounts']
            for account in aws_accounts:
                aws_account_id = str(account['account_id'])
                enabled_account_specific_namespace_rules = {}
                for service, enabled in account['account_specific_namespace_rules'].items():
                    if enabled:
                        enabled_account_specific_namespace_rules[service] = enabled
                account['account_specific_namespace_rules'] = enabled_account_specific_namespace_rules
                model_data[aws_account_id] = account
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, aws_account_id, account)
        except Exception as e:
            print(f'Error extracting active aws integrations: {e}')
        return model_data

    def extract_active_aws_log_integrations(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_LIVE_INTEGRATION_AWS_LOG
        model_data = {}
        try:
            response = self.__dd_api_processor.fetch_aws_log_integrations()
            if not response or len(response) == 0:
                return model_data
            for account in response:
                account_dict = account.to_dict()
                aws_account_id = str(account_dict['account_id'])
                model_data[aws_account_id] = account_dict
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, aws_account_id, account_dict)
        except Exception as e:
            print(f'Error extracting active aws log integrations: {e}')
        return model_data

    def extract_active_azure_integrations(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_LIVE_INTEGRATION_AZURE
        model_data = {}
        try:
            response = self.__dd_api_processor.fetch_azure_integrations()
            if not response or response.value is None:
                return model_data
            for azure_account in response.value:
                client_id = str(azure_account.get('client_id', None))
                if client_id:
                    model_data[client_id] = azure_account
                    if save_to_db:
                        self.create_or_update_model_metadata(model_type, client_id, azure_account)
        except Exception as e:
            print(f'Error extracting active azure integrations: {e}')
        return model_data

    def extract_active_cloudflare_integrations(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_LIVE_INTEGRATION_CLOUDFLARE
        model_data = {}
        try:
            response = self.__dd_api_processor.fetch_cloudflare_integrations()
            if not response or 'data' not in response:
                return model_data
            data = response['data']
            for ca in data:
                c_id = str(ca['id'])
                model_data[c_id] = ca
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, c_id, ca)
        except Exception as e:
            print(f'Error extracting active cloudflare integrations: {e}')
        return model_data

    def extract_active_confluent_integrations(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_LIVE_INTEGRATION_CONFLUENT
        model_data = {}
        try:
            response = self.__dd_api_processor.fetch_confluent_integrations()
            if not response or 'data' not in response:
                return model_data
            data = response['data']
            for ca in data:
                c_id = str(ca['id'])
                model_data[c_id] = ca
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, c_id, ca)
        except Exception as e:
            print(f'Error extracting active confluent integrations: {e}')
        return model_data

    def extract_active_fastly_integrations(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_LIVE_INTEGRATION_FASTLY
        model_data = {}
        try:
            response = self.__dd_api_processor.fetch_fastly_integrations()
            if not response or 'data' not in response:
                return model_data
            data = response['data']
            for fa in data:
                f_id = str(fa['id'])
                model_data[f_id] = fa
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, f_id, fa)
        except Exception as e:
            print(f'Error extracting active fastly integrations: {e}')
        return model_data

    def extract_active_gcp_integrations(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.DATADOG_LIVE_INTEGRATION_GCP
        model_data = {}
        try:
            response = self.__dd_api_processor.fetch_gcp_integrations()
            if not response or 'data' not in response:
                return model_data
            data = response['data']
            for gcpa in data:
                gcp_id = str(gcpa['id'])
                model_data[gcp_id] = gcpa
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, gcp_id, gcpa)
        except Exception as e:
            print(f'Error extracting active gcp integrations: {e}')
        return model_data

    def extract_metrics(self, save_to_db=False):
        model_data = {}

        try:
            all_metrics = self.__dd_api_processor.fetch_metrics().get('data', [])
        except Exception as e:
            print(f'Error fetching metrics: {e}')
            all_metrics = []
        if not all_metrics:
            return model_data
        for mt in all_metrics:
            try:
                tags = self.__dd_api_processor.fetch_metric_tags(mt['id']).get('data', {}).get('attributes', {}).get(
                    'tags', [])
            except Exception as e:
                print(f'Error fetching metric tags for metric: {mt["id"]} - {e}')
                tags = []
            family = mt['id'].split('.')[0]
            model_data[mt['id']] = {**mt, 'tags': tags, 'family': family}
            if save_to_db:
                self.create_or_update_model_metadata(ConnectorMetadataModelTypeProto.DATADOG_METRIC, mt['id'],
                                                     model_data[mt['id']])
        return model_data
