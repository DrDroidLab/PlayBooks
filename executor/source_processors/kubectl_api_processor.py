import base64
import logging
import subprocess
import tempfile

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class KubectlApiProcessor(Processor):
    client = None

    def __init__(self, api_server, token, ssl_ca_cert=None, ssl_ca_cert_path=None):
        self.__api_server = api_server
        self.__token = token
        self.__ca_cert = None
        if ssl_ca_cert_path:
            self.__ca_cert = ssl_ca_cert_path
        elif ssl_ca_cert:
            fp = tempfile.NamedTemporaryFile(delete=False)
            ca_filename = fp.name
            cert_bs = base64.urlsafe_b64decode(ssl_ca_cert.encode('utf-8'))
            fp.write(cert_bs)
            fp.close()
            self.__ca_cert = ca_filename

    def test_connection(self):
        command = "kubectl get namespaces"
        if 'kubectl' in command:
            command = command.replace('kubectl', '')
        if self.__ca_cert:
            kubectl_command = [
                                  "kubectl",
                                  f"--server={self.__api_server}",
                                  f"--token={self.__token}",
                                  f"--certificate-authority={self.__ca_cert}"
                              ] + command.split()
        else:
            kubectl_command = [
                                  "kubectl",
                                  f"--server={self.__api_server}",
                                  f"--token={self.__token}"
                              ] + command.split()
        try:
            process = subprocess.Popen(kubectl_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            stdout, stderr = process.communicate()
            if process.returncode == 0:
                print("Command Output:", stdout)
                return True
            else:
                print("Error executing command:", stderr)
                return False
        except Exception as e:
            logger.error(f"Exception occurred while executing kubectl command with error: {e}")
            raise e

    def execute_command(self, command):
        command = command.strip()
        if 'kubectl' in command:
            command = command.replace('kubectl', '')
        if self.__ca_cert:
            kubectl_command = [
                                  "kubectl",
                                  f"--server={self.__api_server}",
                                  f"--token={self.__token}",
                                  f"--certificate-authority={self.__ca_cert}"
                              ] + command.split()
        else:
            kubectl_command = [
                                  "kubectl",
                                  f"--server={self.__api_server}",
                                  f"--token={self.__token}"
                              ] + command.split()
        try:
            process = subprocess.Popen(kubectl_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            stdout, stderr = process.communicate()
            if process.returncode == 0:
                print("Command Output:", stdout)
                return stdout
            else:
                print("Error executing command:", stderr)
                return stderr
        except Exception as e:
            logger.error(f"Exception occurred while executing kubectl command with error: {e}")
            raise e
