import logging

from pdpyras import APISession
from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class PdApiProcessor(Processor):
    client = None

    def __init__(self, api_key):
        self.__api_key = api_key
        self.client = APISession(self.__api_key)

    def fetch_service_info(self, service_id: str):
        try:
            service = self.client.rget(f"/services/{service_id}")
            return service
        except Exception as e:
            logger.error(f"Error fetching service info  for service_id: {service_id} with error: {e}")
            return None

    def fetch_incidents(self):
        try:
            incidents = self.client.rget(f"/incidents")
            return incidents
        except Exception as e:
            logger.error(f"Error fetching incidents {e}")

    def fetch_incident(self, incident_id: str):
        try:
            incident = self.client.rget(f"/incidents/{incident_id}")
            return incident
        except Exception as e:
            logger.error(f"Error fetching incident: {incident_id}, Error: {e}")
            return None

    def create_incident(self, service_id: str, title, description, urgency='high'):
        try:
            incident = self.client.rpost("/incidents", json={
                "incident": {
                    "type": "incident",
                    "title": title,
                    "service": {
                        "id": service_id,
                        "type": "service_reference"
                    },
                    "body": {
                        "type": "incident_body",
                        "details": description
                    },
                    "urgency": urgency
                }
            })
            return incident
        except Exception as e:
            logger.error(f"Error creating incident: {e}")
            return None

    def update_incident(self, incident_id: str):
        try:
            response = self.client.rput(f"/incidents/{incident_id}", json={
                {
                    "type": "incident_reference",
                    "status": "acknowledged"
                }
            })
            return response
        except Exception as e:
            logger.error(f"Error updating incident:{incident_id}, Error:{e}")
            return None

    def list_notes(self, incident_id: str):
        try:
            notes = self.client.rget(f"/incidents/{incident_id}/notes")
            return notes
        except Exception as e:
            logger.error(f"Error listing notes for incident: {incident_id}, Error:{e}")

    def create_note(self, incident_id: str, content):
        try:
            note = self.client.rpost(f"incidents/{incident_id}/notes", json={
                {
                    "note": {
                        "content": content
                    }
                }
            })
            return note
        except Exception as e:
            logger.error(f"Error creating note for incident:{incident_id}, Error: {e}")
            return None

    def fetch_users(self, user_id: str):
        try:
            response = self.client.rget(f"/users/{user_id}")
            return response
        except Exception as e:
            logger.error(f"Error listing users: {e}")
            return None

    def test_connection(self):
        try:
            self.client.rget("/users")
            return True
        except Exception as e:
            logger.error(f"Auth test failed: {e}")
            raise e
