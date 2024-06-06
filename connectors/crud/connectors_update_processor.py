import logging

from django.db import IntegrityError

from connectors.crud.connectors_crud import update_or_create_connector
from connectors.models import Connector, integrations_connector_type_connector_keys_map
from utils.time_utils import current_milli_time
from protos.connectors.connector_pb2 import UpdateConnectorOp
from utils.update_processor_mixin import UpdateProcessorMixin

logger = logging.getLogger(__name__)


class ConnectorUpdateProcessor(UpdateProcessorMixin):
    update_op_cls = UpdateConnectorOp

    @staticmethod
    def update_connector_name(elem: Connector, update_op: UpdateConnectorOp.UpdateConnectorName) -> Connector:
        if not update_op.name.value:
            raise Exception(f"New connector name missing for update_connector_name op")
        if update_op.name.value == elem.name:
            return elem
        elem.name = update_op.name.value
        try:
            elem.save(update_fields=['name'])
        except IntegrityError as ex:
            logger.error(f"Error occurred updating connector name for {elem.name} with error: {ex}")
            raise Exception(f"Connector with name {update_op.name.value} already exists")
        return elem

    @staticmethod
    def update_connector_status(elem: Connector, update_op: UpdateConnectorOp.UpdateConnectorStatus) -> Connector:
        if not elem.is_active:
            raise Exception(f"Connector {elem.name} is already inactive")
        if update_op.is_active.value:
            raise Exception(f"Connector {elem.name} cannot be activated")
        elem.is_active = update_op.is_active.value
        try:
            if not elem.is_active:
                all_connector_keys = elem.connectorkey_set.all()
                for ck in all_connector_keys:
                    ck.is_active = False
                    ck.save(update_fields=['is_active'])
                current_millis = current_milli_time()
                all_connector_metadata = elem.connectormetadatamodelstore_set.filter(is_active=True)
                for cm in all_connector_metadata:
                    cm.is_active = False
                    cm.save(update_fields=['is_active'])
                all_connected_playbooks = elem.playbooksteptaskconnectormapping_set.filter(is_active=True)
                for cp in all_connected_playbooks:
                    cp.is_active = False
                    cp.save(update_fields=['is_active'])
                elem.name = f"{elem.name}###(inactive)###{current_millis}"
                elem.save(update_fields=['is_active', 'name'])
        except Exception as ex:
            logger.error(f"Error occurred updating connector status for {elem.name} with error: {ex}")
            raise Exception(f"Error occurred updating connector status for {elem.name}")
        return elem

    @staticmethod
    def update_connector_keys(elem: Connector, update_op: UpdateConnectorOp.UpdateConnectorKeys) -> Connector:
        if not elem.is_active:
            raise Exception(f"Connector {elem.name} is inactive")
        updated_keys = update_op.connector_keys
        all_ck_types = [ck.key_type for ck in updated_keys]
        required_key_types = integrations_connector_type_connector_keys_map.get(elem.connector_type)
        all_keys_found = False
        for rkt in required_key_types:
            if sorted(rkt) == sorted(all_ck_types):
                all_keys_found = True
                break
        if not all_keys_found:
            raise Exception(f"Invalid keys for connector type {elem.connector_type}")
        try:
            if elem.is_active:
                elem.is_active = False
                all_connector_keys = elem.connectorkey_set.all()
                for ck in all_connector_keys:
                    ck.is_active = False
                    ck.save(update_fields=['is_active'])
                all_connector_metadata = elem.connectormetadatamodelstore_set.filter(is_active=True)
                for cm in all_connector_metadata:
                    cm.is_active = False
                    cm.save(update_fields=['is_active'])
            updated_elem, err = update_or_create_connector(elem.account, elem.created_by, elem.proto, updated_keys,
                                                           update_mode=True)
            if err:
                raise Exception(f"Error occurred updating connector keys for {elem.name} with error: {err}")
            return updated_elem
        except Exception as ex:
            logger.error(f"Error occurred updating connector keys for {elem.name} with error: {ex}")
            raise Exception(f"Error occurred updating connector keys for {elem.name}")


connector_update_processor = ConnectorUpdateProcessor()
