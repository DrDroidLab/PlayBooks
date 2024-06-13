from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.pd_api_processor import PdApiProcessor
from protos.base_pb2 import Source, SourceModelType
from datetime import datetime, timedelta


class PagerDutyConnectorMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, api_token, account_id=None, connector_id=None):
        self.__client = PdApiProcessor(api_token)
        super().__init__(account_id, connector_id, Source.PAGER_DUTY)

    def extract_alerts(self, save_to_db=False):
        model_type = SourceModelType.PAGERDUTY_INCIDENT
        try:
            since_time = (datetime.utcnow() - timedelta(days=7)).isoformat() + 'Z'
            incidents = self.__client.fetch_incidents()
            recent_incidents = [incident for incident in incidents if incident['created_at'] >= since_time]
        except Exception as e:
            print(f'Error fetching incidents: {e}')
            return
        if not recent_incidents:
            return
        model_data = {}
        for incident in recent_incidents:
            incident_id = incident.get('id', '')
            try:
                alerts = self.__client.fetch_alerts(incident_id)
                for alert in alerts:
                    alert_id = alert.get('id', '')
                    model_data[alert_id] = alert
                    if save_to_db:
                        self.create_or_update_model_metadata(model_type, alert_id, alert)
            except Exception as e:
                print(f'Error fetching alerts for incident {incident_id}: {e}')
                continue
        return model_data
