import logging
from datetime import datetime, timedelta

from google.protobuf.struct_pb2 import Struct

from executor.source_processors.argocd_api_processor import ArgoCDAPIProcessor
from protos.connectors.assets.argocd_asset_pb2 import ArgoCDAppsAssetModel, ArgoCDAssetModel
from protos.literal_pb2 import LiteralType, Literal
from protos.playbooks.source_task_definitions.argocd_task_pb2 import ArgoCD

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value, BoolValue, Int64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets
from protos.base_pb2 import TimeRange
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.base_pb2 import Source, SourceModelType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, ApiResponseResult, \
    TableResult
from protos.ui_definition_pb2 import FormField, FormFieldType
from connectors.assets.manager.asset_manager_facade import asset_manager_facade

logger = logging.getLogger(__name__)


class TimeoutException(Exception):
    pass


class ArgoCDSourceManager(PlaybookSourceManager):
    def __init__(self):
        self.source = Source.ARGOCD
        self.task_proto = ArgoCD
        self.task_type_callable_map = {
            ArgoCD.TaskType.FETCH_DEPLOYMENT_INFO: {
                'executor': self.fetch_deployment_info,
                'asset_descriptor': self.argocd_application_asset_descriptor,
                'model_types': [SourceModelType.ARGOCD_APPS],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Fetch Latest Deployment Info',
                'category': 'CI/CD',
                'form_fields': [
                    FormField(key_name=StringValue(value="count"),
                              display_name=StringValue(value="Enter Count"),
                              data_type=LiteralType.LONG,
                              default_value=Literal(type=LiteralType.LONG, long=Int64Value(value=10)),
                              form_field_type=FormFieldType.TEXT_FT),
                    FormField(key_name=StringValue(value="time_since_in_minutes"),
                              display_name=StringValue(value="Enter Duration (in minutes)"),
                              data_type=LiteralType.LONG,
                              default_value=Literal(type=LiteralType.LONG, long=Int64Value(value=1440)),
                              form_field_type=FormFieldType.TEXT_FT),
                    FormField(key_name=StringValue(value="app_name"),
                              display_name=StringValue(value="App Name"),
                              description=StringValue(value='Select App Name'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                ]
            },
            ArgoCD.TaskType.ROLLBACK_APPLICATION: {
                'executor': self.rollback_application,
                'model_types': [],
                # 'task_validator': self.validate_command,
                'task_descriptor': self.rollback_task_descriptor,
                'result_type': PlaybookTaskResultType.API_RESPONSE,
                'display_name': 'Rollback Application',
                'category': 'CI/CD',
                'form_fields': [
                    FormField(key_name=StringValue(value="app_name"),
                              display_name=StringValue(value="App Name"),
                              description=StringValue(value='Select App Name'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="revision"),
                              display_name=StringValue(value="Revision"),
                              description=StringValue(value='Enter Revision to rollback to'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TEXT_FT),
                    FormField(key_name=StringValue(value="deployment_id"),
                              display_name=StringValue(value="Deployment ID"),
                              description=StringValue(value='Enter Deployment ID of the revision'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TEXT_FT),
                ]
            },
            ArgoCD.TaskType.GET_APPLICATION_HEALTH: {
                'executor': self.get_application_health,
                'model_types': [SourceModelType.ARGOCD_APPS],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Application Health',
                'category': 'CI/CD',
                'form_fields': [
                    FormField(key_name=StringValue(value="app_name"),
                              display_name=StringValue(value="App Name"),
                              description=StringValue(value='Select App Name'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT)
                ]
            }
        }

    def get_connector_processor(self, argocd_connector, **kwargs):
        generated_credentials = generate_credentials_dict(argocd_connector.type, argocd_connector.keys)
        return ArgoCDAPIProcessor(**generated_credentials)

    @staticmethod
    def rollback_task_descriptor(argocd_task: ArgoCD):
        try:
            app_name = argocd_task.rollback_application.app_name
            revision = argocd_task.rollback_application.revision
            return f"""Rollback for application {app_name.value} to version {revision.value}"""
        except Exception as e:
            raise Exception(f"Error while generating descriptor for ArgoCD task: {e}")

    def fetch_deployment_info(self, time_range: TimeRange, argocd_task: ArgoCD,
                              argocd_connector: ConnectorProto) -> PlaybookTaskResult:
        # Loop through the commits and get the diff for each one
        try:
            deployment_info = self.get_connector_processor(argocd_connector).get_deployment_info()
            deployment_count = argocd_task.fetch_deployment_info.count
            app_name = argocd_task.fetch_deployment_info.app_name
            time_since_in_minutes = argocd_task.fetch_deployment_info.time_since_in_minutes

            end_time = datetime.now()

            if time_since_in_minutes and time_since_in_minutes.value:
                start_time = datetime.now() - timedelta(minutes=time_since_in_minutes.value)
            else:
                start_time = datetime.now() - timedelta(minutes=24 * 3 * 60)
            start_time, end_time = int(start_time.timestamp()), int(end_time.timestamp())

            rows = []
            for item in deployment_info.get('items', []):
                for hist in item.get('status', {}).get('history', []):
                    timestamp_str = hist['deployedAt']
                    dt = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%SZ")
                    epoch_seconds = int(dt.timestamp())

                    include = True

                    if app_name and app_name.value not in hist['source']['path']:
                        include = False

                    if end_time < epoch_seconds or start_time > epoch_seconds:
                        include = False

                    if include:
                        name_column = TableResult.TableColumn(name=StringValue(value='app_name'),
                                                              value=StringValue(value=hist['source']['path']))
                        time_column = TableResult.TableColumn(name=StringValue(value='deployment_time'),
                                                              value=StringValue(value=hist['deployedAt']))
                        revision_column = TableResult.TableColumn(name=StringValue(value='Revision'),
                                                                  value=StringValue(value=hist['revision']))
                        deployment_id_column = TableResult.TableColumn(name=StringValue(value='Deployment ID'),
                                                                       value=StringValue(value=str(hist['id'])))
                        row = TableResult.TableRow(
                            columns=[name_column, time_column, revision_column, deployment_id_column])
                        rows.append(row)

            if rows:
                rows = sorted(rows, key=lambda x: x.columns[1].value.value, reverse=True)

                if deployment_count and deployment_count.value and deployment_count.value < len(rows):
                    rows = rows[:deployment_count.value]

                return PlaybookTaskResult(
                    type=PlaybookTaskResultType.TABLE,
                    source=self.source,
                    table=TableResult(
                        raw_query=StringValue(value=f"{len(rows)} Deployments found"),
                        total_count=UInt64Value(value=len(rows)), 
                        rows=rows
                    )
                )
            else:
                return PlaybookTaskResult(
                    type=PlaybookTaskResultType.TABLE,
                    source=self.source,
                    table=TableResult(
                        raw_query=StringValue(value="No Deployments found"),
                        total_count=UInt64Value(value=len(rows)), 
                        rows=rows
                    )
                )
        except Exception as e:
            raise Exception(f"Error while executing ArgoCD fetch_deployment_info task: {e}")

    def rollback_application(self, time_range: TimeRange, argocd_task: ArgoCD,
                             argocd_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            app_name = argocd_task.rollback_application.app_name
            revision = argocd_task.rollback_application.revision
            deployment_id = argocd_task.rollback_application.deployment_id

            argocd_api_processor = self.get_connector_processor(argocd_connector)

            app_details = argocd_api_processor.get_application_details(app_name.value)
            if not app_details:
                raise Exception(f"Application {app_name.value} not found in ArgoCD")

            sync_policy = app_details.get("spec", {}).get("syncPolicy", {})
            if "automated" in sync_policy:
                argocd_api_processor.disable_auto_sync(app_name.value)

            argocd_api_processor.update_application_revision(app_name.value, revision.value, int(deployment_id.value))

            response_obj = {
                "response": f"Successfully rolled back application {app_name.value} to version {revision.value}"}
            response_body = Struct()
            response_body.update(response_obj)

            return PlaybookTaskResult(
                type=PlaybookTaskResultType.API_RESPONSE,
                source=self.source,
                api_response=ApiResponseResult(
                    response_body=response_body
                )
            )
        except Exception as e:
            raise Exception(f"Error while executing ArgoCD rollback_application task: {e}")

    @staticmethod
    def validate_command(argocd_task: ArgoCD):
        return "REQUIRES_APPROVAL"

    @staticmethod
    def argocd_application_asset_descriptor(argocd_connector: ConnectorProto, filters: dict = None) -> str:
        try:
            assets: AccountConnectorAssets = asset_manager_facade.get_asset_model_values(argocd_connector,
                                                                                         SourceModelType.ARGOCD_APPS,
                                                                                         AccountConnectorAssetsModelFilters())
            if not assets:
                logger.warning(
                    f"ArgoCDSourcesManager.argocd_application_asset_descriptor:: No assets found for connector"
                    f" app : {argocd_connector.account_id.value}, and Connector: {argocd_connector.id.value}")
                return None

            assets = assets[0]
            argocd_assets: [ArgoCDAppsAssetModel] = assets.argocd.assets
            all_app_asset: [ArgoCDAppsAssetModel] = [argocd_asset.argocd_apps for argocd_asset in argocd_assets if
                                                     argocd_asset.type == SourceModelType.ARGOCD_APPS]
            asset_list_string = ""
            # TODO(VG: clean this up later)
            asset_list_string += "These are all the application deployments in ArgoCD. If a user-asked application contains more application within itself, then don't fetch information for these contained applications.: \n\n"
            for app_asset in all_app_asset:
                asset_list_string += f"{app_asset.name.value} has path {app_asset.path.value},\n"
                asset_list_string += "\n\n"
            return asset_list_string

        except Exception as e:
            logger.error(f"ArgoCDSourcesManager.argocd_application_asset_descriptor:: Error while generating "
                         f"asset descriptor for account: {argocd_connector.account_id.value} and connector: "
                         f"{argocd_connector.id.value} with error: {e}")
        return None

    def get_application_health(self, time_range: TimeRange, argocd_task: ArgoCD,
                              argocd_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            app_name = argocd_task.get_application_health.app_name

            argocd_api_processor = self.get_connector_processor(argocd_connector)
            health_info = argocd_api_processor.get_application_health(app_name.value)

            if not health_info:
                return PlaybookTaskResult(
                    type=PlaybookTaskResultType.TABLE,
                    source=self.source,
                    table=TableResult(
                        raw_query=StringValue(value=f"No health information found for application {app_name.value}"),
                        total_count=UInt64Value(value=0),
                        rows=[]
                    )
                )

            # Create table columns for the health information
            status_column = TableResult.TableColumn(
                name=StringValue(value='Status'),
                value=StringValue(value=health_info['status'])
            )
            sync_status_column = TableResult.TableColumn(
                name=StringValue(value='Sync Status'),
                value=StringValue(value=health_info['sync_status'])
            )

            # Create a single row with all the health information
            row = TableResult.TableRow(columns=[
                status_column,
                sync_status_column
            ])

            return PlaybookTaskResult(
                type=PlaybookTaskResultType.TABLE,
                source=self.source,
                table=TableResult(
                    raw_query=StringValue(value=f"Health status for application {app_name.value}"),
                    total_count=UInt64Value(value=1),
                    rows=[row]
                )
            )

        except Exception as e:
            raise Exception(f"Error while executing ArgoCD get_application_health task: {e}")
