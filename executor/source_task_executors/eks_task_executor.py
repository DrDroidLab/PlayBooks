from datetime import datetime, timezone
from operator import attrgetter
from typing import Dict

import kubernetes
from google.protobuf.wrappers_pb2 import StringValue
from kubernetes.client import V1PodList, V1DeploymentList, CoreV1EventList, V1ServiceList

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.aws_boto_3_api_processor import get_eks_api_instance
from protos.base_pb2 import Source, TimeRange, SourceModelType, SourceKeyType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.eks_task_pb2 import Eks


class EksSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.EKS
        self.task_proto = Eks
        self.task_type_callable_map = {
            Eks.TaskType.GET_PODS: {
                'display_name': 'EKS Pods',
                'task_type': 'GET_PODS',
                'model_types': [SourceModelType.EKS_CLUSTER],
                'executor': self.get_pods
            },
            Eks.TaskType.GET_DEPLOYMENTS: {
                'display_name': 'EKS Deployments',
                'task_type': 'GET_DEPLOYMENTS',
                'model_types': [SourceModelType.EKS_CLUSTER],
                'executor': self.get_deployments
            },
            Eks.TaskType.GET_EVENTS: {
                'display_name': 'EKS Events',
                'task_type': 'GET_EVENTS',
                'model_types': [SourceModelType.EKS_CLUSTER],
                'executor': self.get_events
            },
            Eks.TaskType.GET_SERVICES: {
                'display_name': 'EKS Services',
                'task_type': 'GET_SERVICES',
                'model_types': [SourceModelType.EKS_CLUSTER],
                'executor': self.get_services
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
        return get_eks_api_instance(**generated_credentials)

    def get_pods(self, time_range: TimeRange, global_variable_set: Dict, eks_task: Eks,
                 eks_connector: ConnectorProto) -> PlaybookTaskResult:
        eks_command = eks_task.command
        aws_region = eks_command.region.value
        cluster_name = eks_command.cluster.value
        namespace = eks_command.namespace.value

        current_time = datetime.now(timezone.utc)
        try:
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
            table = TableResult(raw_query=StringValue(value='Get Pods'), rows=table_rows)
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get pods in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get pods in eks: {e}")

    def get_deployments(self, time_range: TimeRange, global_variable_set: Dict, eks_task: Eks,
                        eks_connector: ConnectorProto) -> PlaybookTaskResult:
        eks_command = eks_task.command
        aws_region = eks_command.region.value
        cluster_name = eks_command.cluster.value
        namespace = eks_command.namespace.value

        current_time = datetime.now(timezone.utc)
        try:
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
            table = TableResult(raw_query=StringValue(value='Get Deployments'), rows=table_rows)
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get deployments in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get deployments in eks: {e}")

    def get_events(self, time_range: TimeRange, global_variable_set: Dict, eks_task: Eks,
                   eks_connector: ConnectorProto) -> PlaybookTaskResult:
        eks_command = eks_task.command
        aws_region = eks_command.region.value
        cluster_name = eks_command.cluster.value
        namespace = eks_command.namespace.value

        current_time = datetime.now(timezone.utc)
        try:
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
            table = TableResult(raw_query=StringValue(value='Get Events'), rows=table_rows)
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get events in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get events in eks: {e}")

    def get_services(self, time_range: TimeRange, global_variable_set: Dict, eks_task: Eks,
                     eks_connector: ConnectorProto) -> PlaybookTaskResult:
        eks_command = eks_task.command
        aws_region = eks_command.region.value
        cluster_name = eks_command.cluster.value
        namespace = eks_command.namespace.value

        current_time = datetime.now(timezone.utc)
        try:
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
            table = TableResult(raw_query=StringValue(value='Get Services'), rows=table_rows)
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get services in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get services in eks: {e}")
