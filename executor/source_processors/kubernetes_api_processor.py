import logging

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class KubernetesApiProcessor(Processor):
    client = None

    def __init__(self, kubernetes_client_instance):
        self.__kubernetes_client_instance = kubernetes_client_instance

    def test_connection(self):
        pass
