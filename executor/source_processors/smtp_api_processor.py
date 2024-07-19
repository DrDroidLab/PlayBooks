import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class SmtpApiProcessor(Processor):
    client = None

    def __init__(self, username, password, host='smtp.gmail.com', port=587):  # Default host and port are set
        self.__username = username
        self.__password = password
        self.__host = host
        self.__port = port
        self.client = self._create_smtp_client()

    def _create_smtp_client(self):
        try:
            client = smtplib.SMTP(self.__host, self.__port)
            client.starttls()
            client.login(self.__username, self.__password)
            return client
        except Exception as e:
            logger.error(f"Error creating SMTP client: {e}")
            raise e

    def send_email(self, to_email, subject, body, html=True):
        try:
            msg = MIMEMultipart()
            msg['From'] = self.__username
            msg['To'] = to_email
            msg['Subject'] = subject

            if html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))

            self.client.send_message(msg)
            return True
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False

    def test_connection(self):
        try:
            self.client.noop()
            return True
        except Exception as e:
            logger.error(f"SMTP connection test failed: {e}")
            raise e

    def close_connection(self):
        try:
            self.client.quit()
        except Exception as e:
            logger.error(f"Error closing SMTP connection: {e}")
