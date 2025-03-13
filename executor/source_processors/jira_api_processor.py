import json
import logging
import requests
from base64 import b64encode

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class JiraApiProcessor(Processor):
    def __init__(self, jira_cloud_api_key, jira_domain, jira_email):
        if not all([jira_cloud_api_key, jira_domain, jira_email]):
            raise ValueError("All JIRA credentials (api_key, domain, email) are required")

        self.domain = jira_domain
        self.__username = jira_email
        self.__api_token = jira_cloud_api_key
        self.base_url = f"https://{jira_domain}.atlassian.net/rest/api/3"

    @property
    def _auth_headers(self):
        credentials = f"{self.__username}:{self.__api_token}"
        encoded_credentials = b64encode(credentials.encode('utf-8')).decode('utf-8')
        return {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def test_connection(self, timeout=None):
        """Test JIRA connection by fetching current user"""
        try:
            url = f"{self.base_url}/myself"
            response = requests.get(url, headers=self._auth_headers, timeout=timeout)
            if response.status_code == 200:
                return True
            else:
                logger.error(f"Error testing JIRA connection: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Exception occurred while testing JIRA connection: {e}")
            raise e

    def get_users(self, query=None):
        """Get a user in the JIRA instance"""
        try:
            url = f"{self.base_url}/user/search"
            params = {"query": query}
            response = requests.get(url, headers=self._auth_headers, params=params)

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error fetching JIRA users: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Exception occurred while fetching JIRA users: {e}")
            raise e

    def list_all_projects(self):
        """List all projects in the JIRA instance"""
        try:
            url = f"{self.base_url}/project"
            response = requests.get(url, headers=self._auth_headers)

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error fetching JIRA projects: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Exception occurred while fetching JIRA projects: {e}")
            raise e

    def list_all_users(self):
        """List all users in the JIRA instance"""
        try:
            url = f"{self.base_url}/users/search"
            response = requests.get(url, headers=self._auth_headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error fetching JIRA users: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Exception occurred while fetching JIRA users: {e}")
            raise e

    def get_ticket(self, ticket_key):
        """
        Get a JIRA ticket by key
        """
        try:
            url = f"{self.base_url}/issue/{ticket_key}"
            response = requests.get(url, headers=self._auth_headers)

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error fetching JIRA ticket: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Exception occurred while fetching JIRA ticket: {e}")
            raise e

    def create_ticket(self, project_key, summary, description, issue_type="Task", priority=None,
                      labels=None, components=None):
        """
        Create a JIRA ticket with the given details
        """
        try:
            url = f"{self.base_url}/issue"

            # Construct the base JIRA fields
            fields = {
                "project": {"key": project_key},
                "summary": summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": description
                                }
                            ]
                        }
                    ]
                },
                "issuetype": {"name": issue_type}
            }

            # Clean and validate labels if provided
            if labels:
                if isinstance(labels, str):
                    # Split string into list and clean each label
                    cleaned_labels = [label.strip() for label in labels.split(',') if label.strip()]
                else:
                    # Clean each label in the list
                    cleaned_labels = [label.strip() for label in labels if label.strip()]

                if cleaned_labels:
                    fields["labels"] = cleaned_labels

            # Only add priority if explicitly provided and not None
            if priority:
                fields["priority"] = {"name": priority}

            payload = {"fields": fields}

            logger.debug(f"Creating JIRA ticket with payload: {payload}")
            response = requests.post(url, headers=self._auth_headers, json=payload)

            if response.status_code in (200, 201):
                return response.json()

            # If we get a 400 error, let's be more specific in error handling
            if response.status_code == 400:
                error_json = response.json()
                error_details = error_json.get('errors', {})

                # Handle specific error cases
                if 'priority' in error_details:
                    logger.warning("Priority field not supported, retrying without priority")
                    if "priority" in fields:
                        del fields["priority"]
                    payload = {"fields": fields}
                    response = requests.post(url, headers=self._auth_headers, json=payload)
                    if response.status_code in (200, 201):
                        return response.json()

                # Log the specific error for debugging
                logger.error(f"JIRA API error details: {error_details}")

            logger.error(f"Error creating JIRA ticket: {response.status_code} - {response.text}")
            return None

        except Exception as e:
            logger.error(f"Exception occurred while creating JIRA ticket: {e}")
            raise e
    
    def assign_ticket(self, ticket_key, assignee):
        """
        Assign a JIRA ticket to the given user
        """
        try:
            url = f"{self.base_url}/issue/{ticket_key}/assignee"
            payload = {"accountId": assignee}

            response = requests.put(url, headers=self._auth_headers, json=payload)

            if response.status_code == 204:
                return True
            else:
                logger.error(f"Error assigning JIRA ticket: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Exception occurred while assigning JIRA ticket: {e}")
            raise e

    def get_project_metadata(self, project_key):
        """Get project metadata including available issue types, components, etc."""
        try:
            url = f"{self.base_url}/project/{project_key}"
            response = requests.get(url, headers=self._auth_headers)

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error fetching project metadata: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Exception occurred while fetching project metadata: {e}")
            raise e

    def search_tickets(self, query, max_results=10):
        """Search for JIRA tickets using the provided query"""
        try:
            url = f"{self.base_url}/search/jql"
            payload = {
                "jql": query,
                "maxResults": max_results
            }

            response = requests.post(url, headers=self._auth_headers, data=json.dumps(payload))

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error searching JIRA tickets: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Exception occurred while searching JIRA tickets: {e}")
            raise e
