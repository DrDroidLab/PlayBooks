import logging
from typing import Dict

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.smtp_api_processor import SmtpApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType

from protos.playbooks.source_task_definitions.email_task_pb2 import SMTP
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


class SMTPSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.SMTP
        self.task_proto = SMTP
        self.task_type_callable_map = {
            SMTP.TaskType.SEND_EMAIL: {
                'executor': self.execute_send_email,
                'model_types': [],
                'result_type': PlaybookTaskResultType.UNKNOWN,
                'display_name': 'Send an email using SMTP',
                'category': 'Actions',
            },
        }

    def get_connector_processor(self, smtp_connector, **kwargs):
        generated_credentials = generate_credentials_dict(smtp_connector.type, smtp_connector.keys)
        username = generated_credentials.pop('user', None)
        if username is not None:
            generated_credentials['username'] = username

        return SmtpApiProcessor(**generated_credentials)

    def execute_send_email(self, time_range: TimeRange, global_variable_set: Dict,
                           smtp_task: SMTP,
                           smtp_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not smtp_connector:
                raise Exception("Task execution Failed:: No SMTP source found")

            send_email_task: SMTP.SendEmail = smtp_task.send_email
            to_email = send_email_task.to.value
            subject = send_email_task.subject.value
            body = send_email_task.body.value

            if not to_email or not subject or not body:
                raise Exception("Task execution Failed:: Missing required email fields")

            smtp_api_processor = self.get_connector_processor(smtp_connector)
            print(f"Playbook Task Downstream Request: Type -> SMTP, To -> {to_email}", flush=True)

            smtp_api_processor.send_email(to_email, subject, body)

            return PlaybookTaskResult(source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing SMTP task: {e}")
