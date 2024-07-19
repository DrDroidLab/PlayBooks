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
    body = """
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f4f4f9;
                padding: 20px;
            }
            .container {
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }
            h1, h2 {
                color: #333;
                margin-bottom: 20px;
            }
            h2 {
                font-size: 20px;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            p {
                margin: 10px 0;
                font-size: 16px;
                line-height: 1.5;
            }
            a {
                color: #1a73e8;
                text-decoration: none;
            }
            .block {
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
    """
    step_number = 1
    for interpretation in execution_output:
        title = interpretation.title.value
        description = interpretation.description.value
        summary = interpretation.summary.value

        if interpretation.model_type == InterpretationProto.ModelType.WORKFLOW_EXECUTION:
            body += f"""
            <div class="block">
                <h1>{title}</h1>
                <p>{description}</p>
                <p>{summary}</p>
            </div>
            """
        elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_STEP:
            body += f"""
            <div class="block">
                <h2>{step_number}. {title}</h2>
                <p>{description}</p>
            </div>
            """
            step_number += 1
        elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_TASK:
            if interpretation.type == InterpretationProto.Type.TEXT:
                body += f"""
                <div class="block">
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <p>{summary}</p>
                </div>
                """
            elif interpretation.type == InterpretationProto.Type.IMAGE:
                body += f"""
                <div class="block">
                    <p>{description}</p>
                    <img src="{interpretation.image_url.value}" alt="{description}" style="max-width:100%;">
                </div>
                """
            elif interpretation.type == InterpretationProto.Type.CSV_FILE:
                body += f"""
                <div class="block">
                    <p>{description}</p>
                    <p>Here’s the <a href="{interpretation.object_url.value}">CSV file</a>.</p>
                </div>
                """
            elif interpretation.type == InterpretationProto.Type.JSON:
                body += f"""
                <div class="block">
                    <pre><code>{summary}</code></pre>
                </div>
                """

    body += """
        </div>
    </body>
    </html>
    """
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

