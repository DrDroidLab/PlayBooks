import logging
from typing import List

from connectors.crud.connectors_crud import get_db_connectors
from connectors.utils import generate_credentials_dict
from executor.source_processors.smtp_api_processor import SmtpApiProcessor
from executor.workflows.action.action_executor import WorkflowActionExecutor
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_actions.smtp_email_pb2 import SMTPEmailWorkflowAction
from protos.playbooks.workflow_pb2 import WorkflowAction

logger = logging.getLogger(__name__)


def generate_email_body(execution_output: List[InterpretationProto]) -> str:
    body = ""
    step_number = 1
    for interpretation in execution_output:
        title = interpretation.title.value
        description = interpretation.description.value
        summary = interpretation.summary.value

        if interpretation.model_type == InterpretationProto.ModelType.WORKFLOW_EXECUTION:
            body += f"{title}\r\n"
            body += f"{description}\r\n"
            body += f"{summary}\r\n"
        elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_STEP:
            body += f"{step_number}. {title}\r\n"
            step_number += 1
        elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_TASK:
            if interpretation.type == InterpretationProto.Type.TEXT:
                body += f"{description}\r\n"
                body += f"{summary}\r\n"
            elif interpretation.type == InterpretationProto.Type.IMAGE:
                body += f"{description}\r\n"
                body += f'<img src="{interpretation.image_url.value}" alt="{description}">\n'
            elif interpretation.type == InterpretationProto.Type.CSV_FILE:
                body += f"{description}\r\n"
                body += f'Here\'s the <a href="{interpretation.object_url.value}">csv file</a>.\n'
            elif interpretation.type == InterpretationProto.Type.JSON:
                body += f"<pre><code>{summary}</code></pre>\r\n"

    return body


class SMTPEmailWorkflowExecutor(WorkflowActionExecutor):

    def __init__(self):
        self.source = Source.SMTP
        self.type = WorkflowAction.Type.SMTP_EMAIL

    def get_action_connector_processor(self, email_connector: ConnectorProto, **kwargs):
        if not email_connector:
            db_connector = get_db_connectors(connector_type=Source.SMTP, is_active=True)
            if not db_connector:
                raise ValueError('Active Email connector is not configured')
            db_connector = db_connector.first()
            email_connector = db_connector.unmasked_proto

        generated_credentials = generate_credentials_dict(email_connector.type, email_connector.keys)
        return SmtpApiProcessor(**generated_credentials)

    def execute(self, action: WorkflowAction, execution_output: List[InterpretationProto],
                connector: ConnectorProto = None):
        email_config: SMTPEmailWorkflowAction = action.smtp_email
        to_email = email_config.to_email.value
        subject = email_config.subject.value
        if not to_email:
            raise ValueError('Recipient email is not configured in the notification config')

        logger.info(f"Sending email to {to_email}")

        body = generate_email_body(execution_output)

        try:
            smtp_api_processor = self.get_action_connector_processor(connector)
            result = smtp_api_processor.send_email(to_email, subject, body)
            if result:
                return True
            else:
                raise Exception("Failed to send email")
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            raise e

