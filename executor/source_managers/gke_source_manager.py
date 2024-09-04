import kubernetes
from datetime import datetime, timezone
from operator import attrgetter

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from kubernetes.client import V1PodList, V1DeploymentList, CoreV1EventList, V1ServiceList

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.gke_api_processor import GkeApiProcessor
from executor.source_processors.kubectl_api_processor import KubectlApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType, \
    BashCommandOutputResult
from protos.playbooks.source_task_definitions.gke_task_pb2 import Gke
from protos.ui_definition_pb2 import FormField, FormFieldType


class GkeSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.GKE
        self.task_proto = Gke
        self.task_type_callable_map = {
            Gke.TaskType.GET_PODS: {
                'executor': self.get_pods,
                'model_types': [SourceModelType.GKE_CLUSTER],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Pods from GKE Cluster',
                'category': 'Deployment',
                'form_fields': [
                    FormField(key_name=StringValue(value="zone"),
                              display_name=StringValue(value="Zone"),
                              description=StringValue(value='Select GKE Zone'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select GKE Cluster'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                ]
            },
            Gke.TaskType.GET_DEPLOYMENTS: {
                'executor': self.get_deployments,
                'model_types': [SourceModelType.GKE_CLUSTER],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Deployments from GKE Cluster',
                'category': 'Deployment',
                'form_fields': [
                    FormField(key_name=StringValue(value="zone"),
                              display_name=StringValue(value="Zone"),
                              description=StringValue(value='Select GKE Zone'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select GKE Cluster'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                ]
            },
            Gke.TaskType.GET_EVENTS: {
                'executor': self.get_events,
                'model_types': [SourceModelType.GKE_CLUSTER],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Events from GKE Cluster',
                'category': 'Deployment',
                'form_fields': [
                    FormField(key_name=StringValue(value="zone"),
                              display_name=StringValue(value="Zone"),
                              description=StringValue(value='Select GKE Zone'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select GKE Cluster'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                ]
            },
            Gke.TaskType.GET_SERVICES: {
                'executor': self.get_services,
                'model_types': [SourceModelType.GKE_CLUSTER],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Services from GKE Cluster',
                'category': 'Deployment',
                'form_fields': [
                    FormField(key_name=StringValue(value="zone"),
                              display_name=StringValue(value="Zone"),
                              description=StringValue(value='Select GKE Zone'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select GKE Cluster'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                ]
            },
            Gke.TaskType.KUBECTL_COMMAND: {
                'executor': self.execute_kubectl_command,
                'model_types': [SourceModelType.GKE_CLUSTER],
                'result_type': PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                'display_name': 'Execute Kubectl Command in GKE Cluster',
                'category': 'Actions',
                'form_fields': [
                    FormField(key_name=StringValue(value="zone"),
                              display_name=StringValue(value="Zone"),
                              description=StringValue(value='Select GKE Zone'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select GKE Cluster'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="command"),
                              display_name=StringValue(value="Kubectl Command"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.MULTILINE_FT),
                ]
            },
        }

    def get_connector_processor(self, gke_connector, **kwargs):
        generated_credentials = generate_credentials_dict(gke_connector.type, gke_connector.keys)
        api_processor = GkeApiProcessor(**generated_credentials)
        if 'native_connection' not in kwargs or not kwargs['native_connection']:
            return api_processor
        else:
            zone = kwargs.get('zone')
            cluster_name = kwargs.get('cluster_name')
            instance = api_processor.get_api_instance(zone, cluster_name)
            gke_host = instance.api_client.configuration.host
            token = instance.api_client.configuration.api_key.get('authorization')
            ssl_ca_cert_path = instance.api_client.configuration.ssl_ca_cert
            return KubectlApiProcessor(api_server=gke_host, token=token, ssl_ca_cert_path=ssl_ca_cert_path)

    def get_pods(self, time_range: TimeRange, gke_task: Gke, gke_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gke_connector:
                raise Exception("Task execution Failed:: No GKE source found")

            gke_command = gke_task.get_pods
            zone = gke_command.zone.value
            cluster_name = gke_command.cluster.value
            namespace = gke_command.namespace.value

            current_time = datetime.now(timezone.utc)

            gke_connector = self.get_connector_processor(gke_connector)
            table_rows: [TableResult.TableRow] = []
            api_response: V1PodList = gke_connector.list_pods(zone, cluster_name, namespace)
            api_response_dict = api_response.to_dict()
            items = api_response_dict['items']
            for item in items:
                table_columns = []
                pod_name = item['metadata']['name']
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='NAME'), value=StringValue(value=pod_name)))
                status = item['status']
                container_statuses = status['container_statuses']
                all_ready_count = [cs['ready'] for cs in container_statuses].count(True)
                total_container_count = len(container_statuses)
                table_columns.append(TableResult.TableColumn(name=StringValue(value='READY'), value=StringValue(
                    value=f"{all_ready_count}/{total_container_count}")))
                phase = status['phase']
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='STATUS'), value=StringValue(value=phase)))
                restart_count = sum([cs['restart_count'] for cs in container_statuses])
                table_columns.append(TableResult.TableColumn(name=StringValue(value='RESTARTS'),
                                                             value=StringValue(value=str(restart_count))))
                start_time = status['start_time']
                if start_time is not None:
                    age_seconds = (current_time - start_time.replace(tzinfo=timezone.utc)).total_seconds()
                    age_hours = age_seconds / 3600  # 1 hour = 3600 seconds
                    age_str = f"{age_hours:.2f} hours"  # Format the age as a string with 2 decimal places
                else:
                    age_str = "N/A"
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='AGE'), value=StringValue(value=age_str)))
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table_rows = sorted(table_rows, key=lambda x: float(x.columns[4].value.value.split()[0]))
            table = TableResult(raw_query=StringValue(value=f'Get Pods from {zone}, {cluster_name}, {namespace}'),
                                rows=table_rows,
                                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get pods in gke: {e}")
        except Exception as e:
            raise Exception(f"Failed to get pods in gke: {e}")

    def get_deployments(self, time_range: TimeRange, gke_task: Gke,
                        gke_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gke_connector:
                raise Exception("Task execution Failed:: No GKE source found")

            gke_command = gke_task.get_deployments
            zone = gke_command.zone.value
            cluster_name = gke_command.cluster.value
            namespace = gke_command.namespace.value

            current_time = datetime.now(timezone.utc)
            gke_connector = self.get_connector_processor(gke_connector)

            table_rows: [TableResult.TableRow] = []
            api_response: V1DeploymentList = gke_connector.list_deployments(zone, cluster_name, namespace)
            api_response_dict = api_response.to_dict()
            items = api_response_dict['items']
            for item in items:
                table_columns = []
                deployment_name = item['metadata']['name']
                table_columns.append(TableResult.TableColumn(name=StringValue(value='NAME'),
                                                             value=StringValue(value=deployment_name)))
                status = item['status']
                spec = item['spec']
                ready_replicas = status.get('ready_replicas', 0)
                spec_replicas = spec.get('replicas', 0)
                table_columns.append(TableResult.TableColumn(name=StringValue(value='READY'), value=StringValue(
                    value=f"{ready_replicas}/{spec_replicas}")))
                updated_replicas = status.get('updated_replicas', 0)
                table_columns.append(TableResult.TableColumn(name=StringValue(value='UP-TO-DATE'),
                                                             value=StringValue(value=f"{updated_replicas}")))
                available_replicas = status.get('available_replicas', 0)
                table_columns.append(TableResult.TableColumn(name=StringValue(value='AVAILABLE'),
                                                             value=StringValue(value=f"{available_replicas}")))
                age = item['metadata']['creation_timestamp']
                if age is not None:
                    age_seconds = (current_time - age.replace(tzinfo=timezone.utc)).total_seconds()
                    age_hours = age_seconds / 3600  # 1 hour = 3600 seconds
                    age_str = f"{age_hours:.2f} hours"  # Format the age as a string with 2 decimal places
                else:
                    age_str = "N/A"
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='AGE'), value=StringValue(value=age_str)))
                table_rows.append(TableResult.TableRow(columns=table_columns))

            table_rows = sorted(table_rows, key=lambda x: float(x.columns[4].value.value.split()[0]))
            table = TableResult(
                raw_query=StringValue(value=f'Get Deployments from {zone}, {cluster_name}, {namespace}'),
                rows=table_rows,
                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get deployments in gke: {e}")
        except Exception as e:
            raise Exception(f"Failed to get deployments in gke: {e}")

    def get_events(self, time_range: TimeRange, gke_task: Gke, gke_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gke_connector:
                raise Exception("Task execution Failed:: No GKE source found")

            gke_command = gke_task.get_events
            zone = gke_command.zone.value
            cluster_name = gke_command.cluster.value
            namespace = gke_command.namespace.value

            current_time = datetime.now(timezone.utc)

            table_rows: [TableResult.TableRow] = []
            gke_connector = self.get_connector_processor(gke_connector)

            api_response: CoreV1EventList = gke_connector.list_events(zone, cluster_name, namespace)
            sorted_events = sorted(api_response.items, key=attrgetter('metadata.creation_timestamp'))
            for event in sorted_events:
                table_columns = []
                last_seen = event.last_timestamp
                if last_seen is not None:
                    age_seconds = (current_time - last_seen.replace(tzinfo=timezone.utc)).total_seconds()
                    if age_seconds > 60:
                        age_minutes = age_seconds / 60  # 1 minute = 60 seconds
                        age_str = f"{age_minutes:.2f}m"  # Format the age as a string with 2 decimal places
                    else:
                        age_str = f"{age_seconds:.2f}s"
                else:
                    age_str = "N/A"
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='LAST SEEN'), value=StringValue(value=age_str)))

                event_type = event.type
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='TYPE'), value=StringValue(value=event_type))
                )
                event_reason = event.reason
                table_columns.append(TableResult.TableColumn(name=StringValue(value='REASON'),
                                                             value=StringValue(value=event_reason)))
                kind = event.involved_object.kind
                name = event.involved_object.name if event.involved_object.name else ""
                table_columns.append(TableResult.TableColumn(name=StringValue(value='OBJECT'),
                                                             value=StringValue(value=f"{kind}/{name}")))
                message = event.message
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='MESSAGE'), value=StringValue(value=message)))
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table = TableResult(raw_query=StringValue(value=f'Get Events from {zone}, {cluster_name}, {namespace}'),
                                rows=table_rows,
                                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get events in gke: {e}")
        except Exception as e:
            raise Exception(f"Failed to get events in gke: {e}")

    def get_services(self, time_range: TimeRange, gke_task: Gke, gke_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gke_connector:
                raise Exception("Task execution Failed:: No GKE source found")

            gke_command = gke_task.get_services
            zone = gke_command.zone.value
            cluster_name = gke_command.cluster.value
            namespace = gke_command.namespace.value

            current_time = datetime.now(timezone.utc)
            gke_connector = self.get_connector_processor(gke_connector)

            table_rows: [TableResult.TableRow] = []
            services: V1ServiceList = gke_connector.list_services(zone, cluster_name, namespace)
            for service in services.items:
                table_columns = []
                name = service.metadata.name
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='NAME'), value=StringValue(value=name)))
                service_type = service.spec.type
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='TYPE'), value=StringValue(value=service_type)))
                cluster_ip = service.spec.cluster_ip
                table_columns.append(TableResult.TableColumn(name=StringValue(value='CLUSTER-IP'),
                                                             value=StringValue(value=cluster_ip)))
                external_ip = service.spec.external_i_ps[0] if service.spec.external_i_ps else ""
                table_columns.append(TableResult.TableColumn(name=StringValue(value='EXTERNAL-IP'),
                                                             value=StringValue(value=external_ip)))
                ports = ", ".join(
                    [f"{port.port}/{port.protocol}" for port in service.spec.ports]) if service.spec.ports else ""

                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='PORT(S)'), value=StringValue(value=ports)))
                age = service.metadata.creation_timestamp
                if age is not None:
                    age_seconds = (current_time - age.replace(tzinfo=timezone.utc)).total_seconds()
                    age_hours = age_seconds / 3600  # 1 hour = 3600 seconds
                    age_str = f"{age_hours:.2f} hours"  # Format the age as a string with 2 decimal places
                else:
                    age_str = "N/A"
                table_columns.append(
                    TableResult.TableColumn(name=StringValue(value='AGE'), value=StringValue(value=age_str)))
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table_rows = sorted(table_rows, key=lambda x: float(x.columns[5].value.value.split()[0]))
            table = TableResult(raw_query=StringValue(value=f'Get Services from {zone}, {cluster_name}, {namespace}'),
                                rows=table_rows,
                                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get services in gke: {e}")
        except Exception as e:
            raise Exception(f"Failed to get services in gke: {e}")

    def execute_kubectl_command(self, time_range: TimeRange, gke_task: Gke,
                                gke_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gke_connector:
                raise Exception("Task execution Failed:: No EKS source found")

            gke_command = gke_task.kubectl_command
            zone = gke_command.zone.value
            cluster_name = gke_command.cluster.value

            command_str = gke_command.command.value
            commands = command_str.split('\n')

            try:
                outputs = {}
                kubectl_client = self.get_connector_processor(gke_connector, native_connection=True, zone=zone,
                                                              cluster_name=cluster_name)
                for command in commands:
                    command_to_execute = command
                    output = kubectl_client.execute_command(command_to_execute)
                    outputs[command] = output

                command_output_protos = []
                for command, output in outputs.items():
                    bash_command_result = BashCommandOutputResult.CommandOutput(
                        command=StringValue(value=command),
                        output=StringValue(value=output)
                    )
                    command_output_protos.append(bash_command_result)

                return PlaybookTaskResult(
                    source=self.source,
                    type=PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                    bash_command_output=BashCommandOutputResult(
                        command_outputs=command_output_protos
                    )
                )
            except Exception as e:
                raise Exception(f"Error while executing GKE kubectl task: {e}")
        except Exception as e:
            raise Exception(f"Error while executing GKE kubectl task: {e}")
