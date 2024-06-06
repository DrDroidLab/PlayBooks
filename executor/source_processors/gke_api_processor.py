import base64
import json
import logging
import tempfile

import kubernetes
from google.auth.transport.requests import Request, AuthorizedSession
from google.oauth2 import service_account
from googleapiclient.discovery import build

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


def get_gke_credentials(service_account_json_str):
    service_account_json = json.loads(service_account_json_str)
    scopes = ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/userinfo.email"]
    credentials = service_account.Credentials.from_service_account_info(service_account_json, scopes=scopes)

    # Refresh the credentials
    auth_req = Request()
    credentials.refresh(auth_req)

    return credentials


def get_gke_api_instance(project_id, service_account_json, zone, cluster_name, client='api'):
    try:
        credentials = get_gke_credentials(service_account_json)
        cluster_url = f"https://container.googleapis.com/v1/projects/{project_id}/locations/{zone}/clusters/{cluster_name}"
        authed_session = AuthorizedSession(credentials)
        response = authed_session.request('GET', cluster_url)
        cluster_data = response.json()

        endpoint = cluster_data['endpoint']
        ca_certificate = cluster_data['masterAuth']['clusterCaCertificate']

        fp = tempfile.NamedTemporaryFile(delete=False)
        ca_filename = fp.name
        ca_cert_bytes = base64.b64decode(ca_certificate)
        fp.write(ca_cert_bytes)
        fp.close()

        # Kubernetes client config
        conf = kubernetes.client.Configuration()
        conf.host = f"https://{endpoint}"
        conf.api_key['authorization'] = credentials.token
        conf.api_key_prefix['authorization'] = 'Bearer'
        conf.ssl_ca_cert = ca_filename
        conf.verify_ssl = True
        with kubernetes.client.ApiClient(conf) as api_client:
            if client == 'api':
                api_instance = kubernetes.client.CoreV1Api(api_client)
                return api_instance
            elif client == 'app':
                app_instance = kubernetes.client.AppsV1Api(api_client)
                return app_instance
    except Exception as e:
        logger.error(f"Exception occurred while configuring kubernetes client with error: {e}")
        raise e


class GkeApiProcessor(Processor):
    client = None

    def __init__(self, project_id, service_account_json):
        self.__service_account_json = service_account_json
        self.__project_id = project_id

    def test_connection(self):
        try:
            # Load service account credentials from JSON file
            credentials = get_gke_credentials(self.__service_account_json)

            service = build('container', 'v1', credentials=credentials)

            # Get the list of all clusters
            clusters_list = []
            parent = f'projects/{self.__project_id}/locations/-'
            request = service.projects().locations().clusters().list(parent=parent)

            while request is not None:
                response = request.execute()
                clusters = response.get('clusters', [])
                for cluster in clusters:
                    clusters_list.append({
                        'name': cluster['name'],
                        'location': cluster['location'],
                        'status': cluster['status']
                    })

                # Check if there's a next page
                if 'nextPageToken' in response:
                    request = service.projects().locations().clusters().list(parent=parent,
                                                                             pageToken=response['nextPageToken'])
                else:
                    request = None
            return len(clusters_list) > 0
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            raise e

    def list_clusters(self):
        # Load service account credentials from JSON file
        credentials = get_gke_credentials(self.__service_account_json)

        service = build('container', 'v1', credentials=credentials)

        # Get the list of all clusters
        clusters_list = []
        parent = f'projects/{self.__project_id}/locations/-'
        request = service.projects().locations().clusters().list(parent=parent)

        while request is not None:
            response = request.execute()
            clusters = response.get('clusters', [])
            for cluster in clusters:
                clusters_list.append({
                    'name': cluster['name'],
                    'zone': cluster['location'],
                })

            # Check if there's a next page
            if 'nextPageToken' in response:
                request = service.projects().locations().clusters().list(parent=parent,
                                                                         pageToken=response['nextPageToken'])
            else:
                request = None

        return clusters_list

    def list_namespaces(self, zone, cluster_name):
        api_client = get_gke_api_instance(self.__project_id, self.__service_account_json, zone, cluster_name)
        namespaces = api_client.list_namespace()
        namespace_list = []
        for ns in namespaces.items:
            namespace_list.append(ns.metadata.name)
        return namespace_list

    def list_pods(self, zone, cluster_name, namespace=None):
        api_client = get_gke_api_instance(self.__project_id, self.__service_account_json, zone, cluster_name)
        if namespace:
            pods = api_client.list_namespaced_pod(namespace, pretty='pretty')
        else:
            pods = api_client.list_pod_for_all_namespaces(watch=False, pretty='pretty')
        return pods

    def list_deployments(self, zone, cluster_name, namespace):
        api_client = get_gke_api_instance(self.__project_id, self.__service_account_json, zone, cluster_name,
                                          client='app')
        deployments = api_client.list_namespaced_deployment(namespace)
        return deployments

    def list_services(self, zone, cluster_name, namespace):
        api_client = get_gke_api_instance(self.__project_id, self.__service_account_json, zone, cluster_name)
        services = api_client.list_namespaced_service(namespace)
        return services

    def list_events(self, zone, cluster_name, namespace='kube-system'):
        api_client = get_gke_api_instance(self.__project_id, self.__service_account_json, zone, cluster_name)
        events = api_client.list_namespaced_event(namespace)
        return events
