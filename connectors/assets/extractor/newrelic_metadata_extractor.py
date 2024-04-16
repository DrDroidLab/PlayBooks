from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.new_relic_graph_ql_processor import NewRelicGraphQlConnector
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, ConnectorType


class NewrelicConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, nr_api_key, nr_app_id, nr_api_domain='api.newrelic.com', account_id=None, connector_id=None):
        self.__gql_processor = NewRelicGraphQlConnector(nr_api_key, nr_app_id, nr_api_domain)

        super().__init__(account_id, connector_id, ConnectorType.NEW_RELIC)

    def extract_policy(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.NEW_RELIC_POLICY
        cursor = 'null'
        policies = []
        policies_search = self.__gql_processor.get_all_policies(cursor)
        if 'policies' not in policies_search:
            return
        results = policies_search['policies']
        policies.extend(results)
        if 'nextCursor' in policies_search:
            cursor = policies_search['nextCursor']
        while cursor and cursor != 'null':
            policies_search = self.__gql_processor.get_all_policies(cursor)
            if 'policies' in policies_search:
                results = policies_search['policies']
                policies.extend(results)
                if 'nextCursor' in policies_search:
                    cursor = policies_search['nextCursor']
                else:
                    cursor = None
            else:
                break
        model_data = {}
        for policy in policies:
            policy_id = policy['id']
            model_data[policy_id] = policy
            if save_to_db:
                self.create_or_update_model_metadata(model_type, policy_id, policy)
        return model_data

    def extract_entity(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY
        cursor = 'null'
        types = ['HOST', 'MONITOR', 'WORKLOAD']
        entity_search = self.__gql_processor.get_all_entities(cursor, types)
        if 'results' not in entity_search:
            return
        results = entity_search['results']
        entities = []
        if 'entities' in results:
            entities.extend(results['entities'])
        if 'nextCursor' in results:
            cursor = results['nextCursor']
        while cursor and cursor != 'null':
            entity_search = self.__gql_processor.get_all_entities(cursor, types)
            if 'results' in entity_search:
                results = entity_search['results']
                if 'entities' in results:
                    entities.extend(results['entities'])
                if 'nextCursor' in results:
                    cursor = results['nextCursor']
                else:
                    cursor = None
            else:
                break
        model_data = {}
        for entity in entities:
            entity_guid = entity['guid']
            model_data[entity_guid] = entity
            if save_to_db:
                self.create_or_update_model_metadata(model_type, entity_guid, entity)
        return model_data

    def extract_condition(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.NEW_RELIC_CONDITION
        cursor = 'null'
        conditions = []
        conditions_search = self.__gql_processor.get_all_conditions(cursor)
        if 'nrqlConditions' not in conditions_search:
            return
        results = conditions_search['nrqlConditions']
        conditions.extend(results)
        if 'nextCursor' in conditions_search:
            cursor = conditions_search['nextCursor']
        while cursor and cursor != 'null':
            conditions_search = self.__gql_processor.get_all_conditions(cursor)
            if 'nrqlConditions' in conditions_search:
                results = conditions_search['nrqlConditions']
                conditions.extend(results)
                if 'nextCursor' in conditions_search:
                    cursor = conditions_search['nextCursor']
                else:
                    cursor = None
            else:
                break
        model_data = {}
        for condition in conditions:
            condition_id = condition['id']
            model_data[condition_id] = condition
            if save_to_db:
                self.create_or_update_model_metadata(model_type, condition_id, condition)
        return model_data

    def extract_dashboard_entity(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_DASHBOARD
        cursor = 'null'
        types = ['DASHBOARD']
        entity_search = self.__gql_processor.get_all_entities(cursor, types)
        if 'results' not in entity_search:
            return
        results = entity_search['results']
        entities = []
        if 'entities' in results:
            entities.extend(results['entities'])
        if 'nextCursor' in results:
            cursor = results['nextCursor']
        while cursor and cursor != 'null':
            entity_search = self.__gql_processor.get_all_entities(cursor, types)
            if 'results' in entity_search:
                results = entity_search['results']
                if 'entities' in results:
                    entities.extend(results['entities'])
                if 'nextCursor' in results:
                    cursor = results['nextCursor']
                else:
                    cursor = None
            else:
                break
        dashboard_entity_guid = [entity['guid'] for entity in entities]
        dashboard_entity_search = self.__gql_processor.get_all_dashboard_entities(dashboard_entity_guid)
        if not dashboard_entity_search or len(dashboard_entity_search) == 0:
            return

        model_data = {}
        for entity in dashboard_entity_search:
            entity_id = entity['guid']
            model_data[entity_id] = entity
            if save_to_db:
                self.create_or_update_model_metadata(model_type, entity_id, entity)
        return model_data

    def extract_application_entity(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_APPLICATION
        cursor = 'null'
        types = ['APPLICATION']
        entity_search = self.__gql_processor.get_all_entities(cursor, types)
        if 'results' not in entity_search:
            return
        results = entity_search['results']
        entities = []
        if 'entities' in results:
            entities.extend(results['entities'])
        if 'nextCursor' in results:
            cursor = results['nextCursor']
        while cursor and cursor != 'null':
            entity_search = self.__gql_processor.get_all_entities(cursor, types)
            if 'results' in entity_search:
                results = entity_search['results']
                if 'entities' in results:
                    entities.extend(results['entities'])
                if 'nextCursor' in results:
                    cursor = results['nextCursor']
                else:
                    cursor = None
            else:
                break
        model_data = {}
        for entity in entities:
            entity_guid = entity['guid']
            model_data[entity_guid] = entity
            if save_to_db:
                self.create_or_update_model_metadata(model_type, entity_guid, entity)
        return model_data
