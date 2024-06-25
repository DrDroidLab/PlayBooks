import logging

from pdpyras import APISession
from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class PdApiProcessor(Processor):
    client = None

    def __init__(self, api_key, configured_email):
        self.__api_key = api_key,
        self.__configured_email = configured_email
        self.client = APISession(self.__api_key)

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

    def fetch_services(self):
        try:
            services = self.client.rget("/services")
            return services
        except Exception as e:
            logger.error(f"Error fetching services: {e}")
            return None

    def fetch_service(self, service_id: str):
        try:
            service = self.client.rget(f"/services/{service_id}")
            return service
        except Exception as e:
            logger.error(f"Error fetching service: {service_id}, Error: {e}")
            return None

    def fetch_alerts(self, incident_id: str):
        try:
            alerts = self.client.rget(f"incident/{incident_id}/alerts")
            return alerts
        except Exception as e:
            logger.error(f"Error fetching alerts for incident id:{incident_id} with errors:{e}")
            return None

    def fetch_specific_alert(self, incident_id: str, alert_id: str):
        try:
            alerts = self.client.rget(f"incident/{incident_id}/alerts/{alert_id}")
            return alerts
        except Exception as e:
            logger.error(f"Error fetching alerts for incident id:{incident_id} with errors:{e}")

    def list_notes(self, incident_id: str):
        try:
            notes = self.client.rget(f"/incidents/{incident_id}/notes")
            return notes
        except Exception as e:
            logger.error(f"Error listing notes for incident: {incident_id}, Error:{e}")

    def create_note(self, incident_id: str, content):
        try:
            content_payload = {
                "note": {
                    "content": content
                }
            }
            url = f"incidents/{incident_id}/notes"
            header = {'From': self.__configured_email}
            print(url, header, content_payload)
            note = self.client.rpost(url, json=content_payload, headers=header)
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
