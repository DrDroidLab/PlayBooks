from datetime import datetime, timezone
from operator import attrgetter
from typing import Dict

import kubernetes
from google.protobuf.wrappers_pb2 import StringValue
from kubernetes.client import V1PodList, V1DeploymentList, CoreV1EventList, V1ServiceList

from connectors.models import Connector, ConnectorKey
from executor.data_fetch_task_executor.data_fetch_task_executor import PlaybookDataFetchTaskExecutor
from integrations_api_processors.aws_boto_3_api_processor import get_eks_api_instance
from protos.base_pb2 import Source, SourceKeyType
from protos.playbooks.playbook_pb2 import PlaybookDataFetchTaskDefinition as PlaybookDataFetchTaskDefinitionProto, \
    PlaybookDataFetchTaskExecutionResult as PlaybookDataFetchTaskExecutionResultProto, \
    PlaybookEksDataFetchTask as PlaybookEksDataFetchTaskProto, TableResult as TableResultProto


class EksDataFetchTaskExecutor(PlaybookDataFetchTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.EKS
        self.__account_id = account_id
        self.task_type_callable_map = {
            PlaybookEksDataFetchTaskProto.CommandType.GET_PODS: self.get_pods,
            PlaybookEksDataFetchTaskProto.CommandType.GET_DEPLOYMENTS: self.get_deployments,
            PlaybookEksDataFetchTaskProto.CommandType.GET_EVENTS: self.get_events,
            PlaybookEksDataFetchTaskProto.CommandType.GET_SERVICES: self.get_services,
        }
        try:
            eks_connector = Connector.objects.get(account_id=account_id,
                                                  connector_type=Source.EKS,
                                                  is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Active EKS connector not found for account: {}".format(account_id))
        if not eks_connector:
            raise Exception("Active EKS connector not found for account: {}".format(account_id))

        eks_connector_keys = ConnectorKey.objects.filter(connector_id=eks_connector.id,
                                                         account_id=account_id,
                                                         is_active=True)
        if not eks_connector_keys:
            raise Exception("Active EKS connector keys not found for account: {}".format(account_id))

        self.__aws_session_token = None
        for key in eks_connector_keys:
            if key.key_type == SourceKeyType.AWS_ACCESS_KEY:
                self.__aws_access_key = key.key
            elif key.key_type == SourceKeyType.AWS_SECRET_KEY:
                self.__aws_secret_key = key.key
            elif key.key_type == SourceKeyType.EKS_ROLE_ARN:
                self.__eks_role_arn = key.key

        if not self.__aws_access_key or not self.__aws_secret_key or not self.__eks_role_arn:
            raise Exception(
                "EKS AWS access key, secret key, eks role arn not found for ""account: {}".format(account_id))

    def execute(self, global_variable_set: Dict,
                task: PlaybookDataFetchTaskDefinitionProto) -> PlaybookDataFetchTaskExecutionResultProto:
        eks_data_fetch_task = task.eks_data_fetch_task
        aws_region = eks_data_fetch_task.region.value
        cluster_name = eks_data_fetch_task.cluster.value
        namespace = eks_data_fetch_task.namespace.value
        command_type = eks_data_fetch_task.command_type
        if command_type in self.task_type_callable_map:
            try:
                return self.task_type_callable_map[command_type](global_variable_set, aws_region, cluster_name,
                                                                 namespace)
            except Exception as e:
                raise Exception(f"Failed to execute EKS data fetch task: {e}")
        else:
            raise Exception(f"Unsupported EKS data fetch task command type: {command_type}")

    def get_pods(self, global_variable_set: Dict, aws_region, cluster_name,
                 namespace) -> PlaybookDataFetchTaskExecutionResultProto:
        current_time = datetime.now(timezone.utc)
        try:
            eks_api_instance = get_eks_api_instance(self.__aws_access_key, self.__aws_secret_key, aws_region,
                                                    self.__eks_role_arn, cluster_name, self.__aws_session_token)
            table_rows: [TableResultProto.TableRow] = []
            api_response: V1PodList = eks_api_instance.list_namespaced_pod(namespace, pretty='pretty')
            api_response_dict = api_response.to_dict()
            items = api_response_dict['items']
            for item in items:
                table_columns = []
                pod_name = item['metadata']['name']
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='NAME'), value=StringValue(value=pod_name)))
                status = item['status']
                container_statuses = status['container_statuses']
                all_ready_count = [cs['ready'] for cs in container_statuses].count(True)
                total_container_count = len(container_statuses)
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='READY'), value=StringValue(
                    value=f"{all_ready_count}/{total_container_count}")))
                phase = status['phase']
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='STATUS'), value=StringValue(value=phase)))
                restart_count = sum([cs['restart_count'] for cs in container_statuses])
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='RESTARTS'),
                                                                  value=StringValue(value=str(restart_count))))
                start_time = status['start_time']
                if start_time is not None:
                    age_seconds = (current_time - start_time.replace(tzinfo=timezone.utc)).total_seconds()
                    age_hours = age_seconds / 3600  # 1 hour = 3600 seconds
                    age_str = f"{age_hours:.2f} hours"  # Format the age as a string with 2 decimal places
                else:
                    age_str = "N/A"
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='AGE'), value=StringValue(value=age_str)))
                table_rows.append(TableResultProto.TableRow(columns=table_columns))
            table_rows = sorted(table_rows, key=lambda x: float(x.columns[4].value.value.split()[0]))
            return PlaybookDataFetchTaskExecutionResultProto(data_source=Source.EKS,
                                                             result=PlaybookDataFetchTaskExecutionResultProto.Result(
                                                                 type=PlaybookDataFetchTaskExecutionResultProto.Result.Type.TABLE_RESULT,
                                                                 table_result=TableResultProto(
                                                                     raw_query=StringValue(value='Get Pods'),
                                                                     rows=table_rows)))

        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get pods in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get pods in eks: {e}")

    def get_deployments(self, global_variable_set: Dict, aws_region, cluster_name,
                        namespace) -> PlaybookDataFetchTaskExecutionResultProto:
        current_time = datetime.now(timezone.utc)
        try:
            eks_app_instance = get_eks_api_instance(self.__aws_access_key, self.__aws_secret_key, aws_region,
                                                    self.__eks_role_arn, cluster_name, self.__aws_session_token,
                                                    client='app')
            table_rows: [TableResultProto.TableRow] = []
            api_response: V1DeploymentList = eks_app_instance.list_namespaced_deployment(namespace)
            api_response_dict = api_response.to_dict()
            items = api_response_dict['items']
            for item in items:
                table_columns = []
                deployment_name = item['metadata']['name']
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='NAME'),
                                                                  value=StringValue(value=deployment_name)))
                status = item['status']
                spec = item['spec']
                ready_replicas = status.get('ready_replicas', 0)
                spec_replicas = spec.get('replicas', 0)
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='READY'), value=StringValue(
                    value=f"{ready_replicas}/{spec_replicas}")))
                updated_replicas = status.get('updated_replicas', 0)
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='UP-TO-DATE'),
                                                                  value=StringValue(value=f"{updated_replicas}")))
                available_replicas = status.get('available_replicas', 0)
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='AVAILABLE'),
                                                                  value=StringValue(value=f"{available_replicas}")))
                age = item['metadata']['creation_timestamp']
                if age is not None:
                    age_seconds = (current_time - age.replace(tzinfo=timezone.utc)).total_seconds()
                    age_hours = age_seconds / 3600  # 1 hour = 3600 seconds
                    age_str = f"{age_hours:.2f} hours"  # Format the age as a string with 2 decimal places
                else:
                    age_str = "N/A"
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='AGE'), value=StringValue(value=age_str)))
                table_rows.append(TableResultProto.TableRow(columns=table_columns))

            table_rows = sorted(table_rows, key=lambda x: float(x.columns[4].value.value.split()[0]))

            return PlaybookDataFetchTaskExecutionResultProto(data_source=Source.EKS,
                                                             result=PlaybookDataFetchTaskExecutionResultProto.Result(
                                                                 type=PlaybookDataFetchTaskExecutionResultProto.Result.Type.TABLE_RESULT,
                                                                 table_result=TableResultProto(
                                                                     raw_query=StringValue(value='Get Deployments'),
                                                                     rows=table_rows)))

        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get deployments in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get deployments in eks: {e}")

    def get_events(self, global_variable_set: Dict, aws_region, cluster_name,
                   namespace) -> PlaybookDataFetchTaskExecutionResultProto:
        current_time = datetime.now(timezone.utc)
        try:
            table_rows: [TableResultProto.TableRow] = []
            eks_api_instance = get_eks_api_instance(self.__aws_access_key, self.__aws_secret_key, aws_region,
                                                    self.__eks_role_arn, cluster_name, self.__aws_session_token)
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
                    TableResultProto.TableColumn(name=StringValue(value='LAST SEEN'), value=StringValue(value=age_str)))

                event_type = event.type
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='TYPE'), value=StringValue(value=event_type))
                )
                event_reason = event.reason
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='REASON'),
                                                                  value=StringValue(value=event_reason)))
                kind = event.involved_object.kind
                name = event.involved_object.name if event.involved_object.name else ""
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='OBJECT'),
                                                                  value=StringValue(value=f"{kind}/{name}")))
                message = event.message
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='MESSAGE'), value=StringValue(value=message)))
                table_rows.append(TableResultProto.TableRow(columns=table_columns))
            return PlaybookDataFetchTaskExecutionResultProto(data_source=Source.EKS,
                                                             result=PlaybookDataFetchTaskExecutionResultProto.Result(
                                                                 type=PlaybookDataFetchTaskExecutionResultProto.Result.Type.TABLE_RESULT,
                                                                 table_result=TableResultProto(
                                                                     raw_query=StringValue(value='Get Events'),
                                                                     rows=table_rows)))

        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get events in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get events in eks: {e}")

    def get_services(self, global_variable_set: Dict, aws_region, cluster_name,
                     namespace) -> PlaybookDataFetchTaskExecutionResultProto:
        current_time = datetime.now(timezone.utc)
        try:
            eks_api_instance = get_eks_api_instance(self.__aws_access_key, self.__aws_secret_key, aws_region,
                                                    self.__eks_role_arn, cluster_name, self.__aws_session_token)
            table_rows: [TableResultProto.TableRow] = []
            services: V1ServiceList = eks_api_instance.list_namespaced_service(namespace)
            for service in services.items:
                table_columns = []
                name = service.metadata.name
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='NAME'), value=StringValue(value=name)))
                service_type = service.spec.type
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='TYPE'), value=StringValue(value=service_type)))
                cluster_ip = service.spec.cluster_ip
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='CLUSTER-IP'),
                                                                  value=StringValue(value=cluster_ip)))
                external_ip = service.spec.external_i_ps[0] if service.spec.external_i_ps else ""
                table_columns.append(TableResultProto.TableColumn(name=StringValue(value='EXTERNAL-IP'),
                                                                  value=StringValue(value=external_ip)))
                ports = ", ".join(
                    [f"{port.port}/{port.protocol}" for port in service.spec.ports]) if service.spec.ports else ""

                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='PORT(S)'), value=StringValue(value=ports)))
                age = service.metadata.creation_timestamp
                if age is not None:
                    age_seconds = (current_time - age.replace(tzinfo=timezone.utc)).total_seconds()
                    age_hours = age_seconds / 3600  # 1 hour = 3600 seconds
                    age_str = f"{age_hours:.2f} hours"  # Format the age as a string with 2 decimal places
                else:
                    age_str = "N/A"
                table_columns.append(
                    TableResultProto.TableColumn(name=StringValue(value='AGE'), value=StringValue(value=age_str)))
                table_rows.append(TableResultProto.TableRow(columns=table_columns))
            table_rows = sorted(table_rows, key=lambda x: float(x.columns[5].value.value.split()[0]))
            return PlaybookDataFetchTaskExecutionResultProto(data_source=Source.EKS,
                                                             result=PlaybookDataFetchTaskExecutionResultProto.Result(
                                                                 type=PlaybookDataFetchTaskExecutionResultProto.Result.Type.TABLE_RESULT,
                                                                 table_result=TableResultProto(
                                                                     raw_query=StringValue(value='Get Services'),
                                                                     rows=table_rows)))
        except kubernetes.client.rest.ApiException as e:
            raise Exception(f"Failed to get services in eks: {e}")
        except Exception as e:
            raise Exception(f"Failed to get services in eks: {e}")
