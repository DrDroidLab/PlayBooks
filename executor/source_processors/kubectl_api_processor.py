import logging
import subprocess
import tempfile

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class KubectlApiProcessor(Processor):
    client = None

    def __init__(self, api_server, token, ca_cert):
        self.__api_server = api_server
        self.__token = token
        fp = tempfile.NamedTemporaryFile(delete=False)
        ca_filename = fp.name
        cert_bs = ca_cert.encode('utf-8')
        fp.write(cert_bs)
        fp.close()
        self.__ca_cert = ca_filename

    def execute_kubectl_command(self, command):
        command = command.strip()
        if 'kubectl' in command:
            command = command.replace('kubectl', '')
        kubectl_command = [
                              "kubectl",
                              f"--server={self.__api_server}",
                              f"--token={self.__token}",
                              f"--certificate-authority={self.__ca_cert}"
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
