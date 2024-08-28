import logging
from executor.source_processors.processor import Processor
import requests

logger = logging.getLogger(__name__)


class RootlyApiProcessor(Processor):
    client = None

    def __init__(self, api_key):
        self.__api_key = api_key
        self.base_url = "https://api.rootly.com/v1"

    def create_timeline_event(self, incident_id: str, content):
        try:
            content_payload = {
                "data": {
                    "type": "incident_events",
                    "attributes": {
                        "event": content,
                        "visibility": "internal"
                    }
                }
            }
            url = f"{self.base_url}/incidents/{incident_id}/events/"
            headers = {
                'Authorization': f'Bearer {self.__api_key}', 
                'Content-Type': 'application/vnd.api+json'
            }

            # Make the POST request
            response = requests.post(url, json=content_payload, headers=headers)

            # Check if the request was successful
            response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)

            logger.info(f"Timeline event created successfully for incident {incident_id}")
            return response.json() 

        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error occurred: {http_err} - {response.text}")
        except Exception as e:
            logger.error(f"Error creating timeline event for incident {incident_id}: {e}")

        return None

    def test_connection(self):
        try:
            url = f"{self.base_url}/users/me"
            headers = {
                'Authorization': f'Bearer {self.__api_key}', 
                'Accept': 'application/vnd.api+json',
            }
            response = requests.get(url, headers=headers)
            response.raise_for_status()

            logger.info("Test connection successful for Rootly")

            # Check if the JSON response has any elements
            json_response = response.json()
            if json_response.get('data') is not None:
                return True

        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error occurred: {http_err} - Response: {http_err.response.text}")
        except requests.exceptions.RequestException as req_err:
            logger.error(f"Request error occurred: {req_err}")
        except Exception as e:
            logger.error(f"Unexpected error testing connection for Rootly: {e}")

        return False