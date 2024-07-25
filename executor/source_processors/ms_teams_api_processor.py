import logging
import requests
from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class MSTeamsApiProcessor(Processor):
    def __init__(self, webhook_url):
        self.__webhook_url = webhook_url

    def send_webhook_message(self, payload):
        try:
            headers = {'Content-Type': 'application/json'}
            message_response = requests.post(self.__webhook_url, headers=headers, json=payload)
            if message_response.status_code == 200:
                try:
                    if message_response.json() == 1:
                        return True
                except Exception as e:
                    if "error" in message_response.text:
                        logger.error("Error in sending message to MSTeams with error: " + message_response.text)
                    raise e
            else:
                logger.error("Error in sending message to MSTeams with error: " + message_response.text)
                return False
        except Exception as e:
            logger.error(f"Error posting MSTeams message: {e}")

    def test_connection(self):
        try:
            result = requests.post(self.__webhook_url, json={"text": "Test message"})
            if result.json() == 1:
                return True
            else:
                raise Exception(f"Error in sending message to MSTeams with error: {result.text}")
        except Exception as e:
            logger.error(f"Error posting MSTeams message: {e}")
            raise e

    def files_upload(self, file_path):
        try:
            # code to upload file to Local server
            file_upload_successful = False
            if file_upload_successful:
                return True
            return False
        except Exception as e:
            logger.error(f"Error posting MSTeams message: {e}")
            return False
