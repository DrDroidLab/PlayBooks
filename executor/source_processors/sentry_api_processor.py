import logging
import time

import requests

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class SentryApiProcessor(Processor):
    client = None

    def __init__(self, api_key):
        self.__api_key = api_key

    def fetch_issue_details(self, issue_id):
        try:
            url = f"https://sentry.io/api/0/issues/{issue_id}/"
            payload = {}
            headers = {
                'Authorization': f'Bearer {self.__api_key}'
            }
            response = requests.request("GET", url, headers=headers, data=payload)
            if response:
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 429 or response.status_code == 403:
                    reset_in_epoch_seconds = int(response.headers.get('X-Sentry-Rate-Limit-Reset', None))
                    if reset_in_epoch_seconds:
                        time.sleep(reset_in_epoch_seconds - int(time.time()))
                        return self.fetch_issue_details(issue_id)
                    else:
                        time.sleep(100)
                        return self.fetch_issue_details(issue_id)
                else:
                    logger.error(f"Error occurred while fetching sentry issue details for issue_id: {issue_id} "
                                 f"with status_code: {response.status_code} and response: {response.text}")
        except Exception as e:
            logger.error(f"Exception occurred while fetching sentry issue details "
                         f"for issue_id: {issue_id} with error: {e}")
        return None
