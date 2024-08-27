import logging

from pdpyras import APISession
from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class ZendutyApiProcessor(Processor):
    client = None

    def __init__(self, api_key):
        self.__api_key = api_key
        self.client = APISession(self.__api_key)

    def create_note(self, incident_number: str, content):
        try:
            content_payload = {
                "note": content
            }
            url = f"incidents/{incident_number}/note"
            header = {'Authorization': self.__api_key}
            print(url, header, content_payload)
            note = self.client.rpost(url, json=content_payload, headers=header)
            return note
        except Exception as e:
            logger.error(f"Error creating note for incident:{incident_number}, Error: {e}")
            return None