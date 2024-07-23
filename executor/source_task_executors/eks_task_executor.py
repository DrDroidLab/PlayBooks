from datetime import datetime, timezone
from operator import attrgetter

import kubernetes
from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from kubernetes.client import V1PodList, V1DeploymentList, CoreV1EventList, V1ServiceList

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.aws_boto_3_api_processor import get_eks_api_instance
from executor.source_processors.kubectl_api_processor import KubectlApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType, SourceKeyType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType, \
    BashCommandOutputResult
from protos.playbooks.source_task_definitions.eks_task_pb2 import Eks
from protos.ui_definition_pb2 import FormField


class EksSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.EKS
        self.task_proto = Eks
        self.task_type_callable_map = {
            Eks.TaskType.GET_PODS: {
                'executor': self.get_pods,
                'model_types': [SourceModelType.EKS_CLUSTER],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Pods from EKS Cluster',
                'category': 'Deployment',
                'form_fields': [
                    FormField(key_name=StringValue(value="region"),
                              display_name=StringValue(value="Region"),
                              description=StringValue(value='Select AWS region'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select EKS cluster'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING),
                ]
            },
            Eks.TaskType.GET_DEPLOYMENTS: {
                'executor': self.get_deployments,
                'model_types': [SourceModelType.EKS_CLUSTER],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Deployments from EKS Cluster',
                'category': 'Deployment',
                'form_fields': [
                    FormField(key_name=StringValue(value="region"),
                              display_name=StringValue(value="Region"),
                              description=StringValue(value='Select AWS region'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select EKS cluster'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING),
                ]
            },
            Eks.TaskType.GET_EVENTS: {
                'executor': self.get_events,
                'model_types': [SourceModelType.EKS_CLUSTER],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Events from EKS Cluster',
                'category': 'Deployment',
                'form_fields': [
                    FormField(key_name=StringValue(value="region"),
                              display_name=StringValue(value="Region"),
                              description=StringValue(value='Select AWS region'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select EKS cluster'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING),
                ]
            },
            Eks.TaskType.GET_SERVICES: {
                'executor': self.get_services,
                'model_types': [SourceModelType.EKS_CLUSTER],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Services from EKS Cluster',
                'category': 'Deployment',
                'form_fields': [
                    FormField(key_name=StringValue(value="region"),
                              display_name=StringValue(value="Region"),
                              description=StringValue(value='Select AWS region'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select EKS cluster'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="namespace"),
                              display_name=StringValue(value="Namespace"),
                              description=StringValue(value='Select Namespace'),
                              data_type=LiteralType.STRING),
                ]
            },
            Eks.TaskType.KUBECTL_COMMAND: {
                'executor': self.execute_kubectl_command,
                'model_types': [SourceModelType.EKS_CLUSTER],
                'result_type': PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                'display_name': 'Execute Kubectl Command in EKS Cluster',
                'category': 'Actions',
                'form_fields': [
                    FormField(key_name=StringValue(value="region"),
                              display_name=StringValue(value="Region"),
                              description=StringValue(value='Select AWS region'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="cluster"),
                              display_name=StringValue(value="Cluster"),
                              description=StringValue(value='Select EKS cluster'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="command"),
                              display_name=StringValue(value="Kubectl Command"),
                              data_type=LiteralType.STRING),
                ]
            },
        }

    def get_connector_processor(self, eks_connector, **kwargs):
        generated_credentials = generate_credentials_dict(eks_connector.type, eks_connector.keys)
        generated_credentials['aws_region'] = kwargs.get('aws_region')
        for key in eks_connector.keys:
            if key.key_type == SourceKeyType.EKS_ROLE_ARN:
                generated_credentials['k8_role_arn'] = key.key.value
                break
        if 'k8_role_arn' not in generated_credentials:
            raise Exception("EKS Role ARN not found in EKS connector keys")
        generated_credentials['cluster_name'] = kwargs.get('cluster_name')
        generated_credentials['client'] = kwargs.get('client', 'api')
        if 'regions' in generated_credentials:
            generated_credentials.pop('regions', None)

        if 'native_connection' not in kwargs or not kwargs['native_connection']:
            return get_eks_api_instance(**generated_credentials)
        else:
            instance = get_eks_api_instance(**generated_credentials)
            eks_host = instance.api_client.configuration.host
            token = instance.api_client.configuration.api_key.get('authorization')
            ssl_ca_cert_path = instance.api_client.configuration.ssl_ca_cert
            return KubectlApiProcessor(api_server=eks_host, token=token, ssl_ca_cert_path=ssl_ca_cert_path)

    def get_pods(self, time_range: TimeRange, eks_task: Eks, eks_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not eks_connector:
                raise Exception("Task execution Failed:: No EKS source found")

            eks_command = eks_task.get_pods
            aws_region = eks_command.region.value
            cluster_name = eks_command.cluster.value
            namespace = eks_command.namespace.value

            current_time = datetime.now(timezone.utc)

            eks_api_instance = self.get_connector_processor(eks_connector, aws_region=aws_region,
                                                            cluster_name=cluster_name, client='api')
            table_rows: [TableResult.TableRow] = []
            api_response: V1PodList = eks_api_instance.list_namespaced_pod(namespace, pretty='pretty')
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
            table = TableResult(raw_query=StringValue(value=f'Get Pods from {aws_region}, {cluster_name}, {namespace}'),
                                rows=table_rows,
                                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get pods in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get pods in eks: {e}")

    def get_deployments(self, time_range: TimeRange, eks_task: Eks,
                        eks_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not eks_connector:
                raise Exception("Task execution Failed:: No EKS source found")

            eks_command = eks_task.get_deployments
            aws_region = eks_command.region.value
            cluster_name = eks_command.cluster.value
            namespace = eks_command.namespace.value

            current_time = datetime.now(timezone.utc)

            eks_app_instance = self.get_connector_processor(eks_connector, aws_region=aws_region,
                                                            cluster_name=cluster_name, client='app')
            table_rows: [TableResult.TableRow] = []
            api_response: V1DeploymentList = eks_app_instance.list_namespaced_deployment(namespace)
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
                raw_query=StringValue(value=f'Get Deployments from {aws_region}, {cluster_name}, {namespace}'),
                rows=table_rows,
                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get deployments in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get deployments in eks: {e}")

    def get_events(self, time_range: TimeRange, eks_task: Eks, eks_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not eks_connector:
                raise Exception("Task execution Failed:: No EKS source found")

            eks_command = eks_task.get_events
            aws_region = eks_command.region.value
            cluster_name = eks_command.cluster.value
            namespace = eks_command.namespace.value

            current_time = datetime.now(timezone.utc)

            table_rows: [TableResult.TableRow] = []
            eks_api_instance = self.get_connector_processor(eks_connector, aws_region=aws_region,
                                                            cluster_name=cluster_name, client='api')
            api_response: CoreV1EventList = eks_api_instance.list_namespaced_event(namespace)
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
            table = TableResult(
                raw_query=StringValue(value=f'Get Events from {aws_region}, {cluster_name}, {namespace}'),
                rows=table_rows,
                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get events in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get events in eks: {e}")

    def get_services(self, time_range: TimeRange, eks_task: Eks, eks_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not eks_connector:
                raise Exception("Task execution Failed:: No EKS source found")

            eks_command = eks_task.get_services
            aws_region = eks_command.region.value
            cluster_name = eks_command.cluster.value
            namespace = eks_command.namespace.value

            current_time = datetime.now(timezone.utc)
            eks_api_instance = self.get_connector_processor(eks_connector, aws_region=aws_region,
                                                            cluster_name=cluster_name, client='api')

            table_rows: [TableResult.TableRow] = []
            services: V1ServiceList = eks_api_instance.list_namespaced_service(namespace)
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
            table = TableResult(
                raw_query=StringValue(value=f'Get Services from {aws_region}, {cluster_name}, {namespace}'),
                rows=table_rows,
                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get services in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get services in eks: {e}")

    def execute_kubectl_command(self, time_range: TimeRange, eks_task: Eks,
                                eks_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not eks_connector:
                raise Exception("Task execution Failed:: No EKS source found")

            eks_command = eks_task.kubectl_command

            aws_region = eks_command.region.value
            cluster_name = eks_command.cluster.value

            command_str = eks_command.command.value
            commands = command_str.split('\n')
            try:
                outputs = {}
                kubectl_client = self.get_connector_processor(eks_connector, aws_region=aws_region,
                                                              cluster_name=cluster_name, client='api',
                                                              native_connection=True)
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
                raise Exception(f"Error while executing EKS kubectl task: {e}")
        except Exception as e:
            raise Exception(f"Error while executing EKS kubectl task: {e}")
