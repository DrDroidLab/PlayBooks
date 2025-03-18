import time
import logging
import requests
import json

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)

class ArgoCDAPIProcessor(Processor):
    def __init__(self, argocd_server, argocd_token):
        self.__token = argocd_token
        self.__server = argocd_server

    def test_connection(self):
        try:
            url = f'{self.__server}/api/v1/projects'
            headers = {
                'Authorization': f'Bearer {self.__token}'
            }
            response = requests.request("GET", url, headers=headers, verify=False)
            if response.status_code == 200:
                return True
            else:
                raise Exception(f"Connection failed: {response.status_code}, {response.text}")
        except Exception as e:
            logger.error(f"Exception occurred while testing ArgoCD with error: {e}")
            raise e

    def get_deployment_info(self):
        try:
            url = f'{self.__server}/api/v1/applications'
            headers = {
                'Authorization': f'Bearer {self.__token}'
            }
            response = requests.request("GET", url, headers=headers, verify=False)
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Error occurred while fetching deployment info from argocd "
                             f"with status_code: {response.status_code} and response: {response.text}")
        except Exception as e:
            logger.error(f"Exception occurred while fetching deployment info from ArgoCD with error: {e}")
            raise e
        
    def get_application_details(self, app_name):
        try:
            url = f'{self.__server}/api/v1/applications/{app_name}'
            headers = {
                'Authorization': f'Bearer {self.__token}'
            }
            response = requests.request("GET", url, headers=headers, verify=False)
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Error occurred while fetching application details from argocd "
                             f"with status_code: {response.status_code} and response: {response.text}")
        except Exception as e:
            logger.error(f"Exception occurred while fetching application details from ArgoCD with error: {e}")
            raise e
        
        
    def disable_auto_sync(self, app_name):
        try:
            url = f'{self.__server}/api/v1/applications/{app_name}'
            headers = {
                'Authorization': f'Bearer {self.__token}'
            }
            
            payload = {
                "patch": "[{\"op\": \"remove\", \"path\": \"/spec/syncPolicy/automated\"}]",
                "patchType": "json"
            }
            
            response = requests.patch(url, headers=headers, json=payload, verify=False)
                        
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Error occurred while disabling auto-sync for {app_name} from argocd "
                             f"with status_code: {response.status_code} and response: {response.text}")
        except Exception as e:
            logger.error(f"Exception occurred while disabling auto-sync for {app_name} from ArgoCD with error: {e}")
            raise e

    def update_application_revision(self, app_name, target_revision, deployment_id):
        """
        Updates the target revision of an application in ArgoCD.
        """
        try:
            url = f'{self.__server}/api/v1/applications/{app_name}/rollback'
            headers = {
                'Authorization': f'Bearer {self.__token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "id": deployment_id,
                "revision": target_revision
            }
                                    
            response = requests.post(url, headers=headers, json=payload, verify=False)
                                    
            if response.status_code in (200, 204):
                logger.info(
                    f"Successfully updated target revision to '{target_revision}' for application '{app_name}'.")
            else:
                raise Exception(f"Error occurred while updating target revision in ArgoCD "
                                f"with status_code: {response.status_code} and response: {response.text}")
        except Exception as e:
            logger.error(
                f"Exception occurred while updating target revision for application '{app_name}' with error: {e}")
            raise e

    def get_application_health(self, app_name):
        """
        Get the health status of a specific ArgoCD application.
        
        Args:
            app_name (str): Name of the ArgoCD application
            
        Returns:
            dict: Application health information including status, message, etc.
            None: If there's an error or application not found
        """
        try:
            url = f'{self.__server}/api/v1/applications/{app_name}'
            headers = {
                'Authorization': f'Bearer {self.__token}'
            }
            response = requests.get(url, headers=headers, verify=False)
            logger.info(f"ArgoCD application health response: {response.json()}")
            if response.status_code == 200:
                app_data = response.json()
                health = app_data.get('status', {}).get('health', {})
                return {
                    'status': health.get('status', 'Unknown'),
                    'sync_status': app_data.get('status', {}).get('sync', {}).get('status', 'Unknown')
                }
            else:
                logger.error(f"Error getting ArgoCD application health: {response.status_code} - {response.text}")
                return None
            
        except Exception as e:
            logger.error(f"Exception occurred while getting ArgoCD application health for {app_name} with error: {e}")
            raise e
        