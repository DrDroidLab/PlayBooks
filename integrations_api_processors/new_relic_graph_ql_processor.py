import json
import logging

from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport

logger = logging.getLogger(__name__)


class NewRelicGraphQlConnector(object):

    def __init__(self, nr_api_key, nr_app_id, nr_api_domain=None):
        if nr_api_domain is None:
            nr_api_domain = "api.newrelic.com"
        self.__nr_api_key = nr_api_key
        self.nr_account_id = nr_app_id
        self.nr_api_domain = nr_api_domain

    def get_connection(self):
        try:
            headers = {
                "Api-Key": self.__nr_api_key,
                "Content-Type": "application/json",
            }

            graphql_endpoint = "https://{}/graphql".format(self.nr_api_domain)
            transport = RequestsHTTPTransport(url=graphql_endpoint, use_json=True, headers=headers, verify=True,
                                              retries=3)

            # Create a GraphQL client
            client = Client(transport=transport, fetch_schema_from_transport=False)
            return client
        except Exception as e:
            logger.error(f"Exception occurred while creating NewRelic client with error: {e}")
            raise e

    def test_connection(self):
        query = gql(f"""{{
                            actor {{
                                account(id: {self.nr_account_id}) {{
                                    name
                                }}
                            }}
                        }}""")

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('account', {})
                if output:
                    return True
            return False
        except Exception as e:
            raise e

    def create_r2d2_webhook_destination(self, drd_api_token):
        mutation = gql(f"""mutation {{
                            aiNotificationsCreateDestination(
                                accountId: {self.nr_account_id}
                                destination: {{auth: {{token: {{token: "{drd_api_token}"}}, type: TOKEN}}, name: "Doctor Droid", properties: [{{displayValue: "", key: "url", value: "https://app.drdroid.io/connectors/integrations/handlers/newrelic/r2d2/handle_alert"}},{{key: "two_way_integration", value: "true"}}], type: WEBHOOK}}
                            ) {{
                                destination {{
                                    id
                                    name
                                }}
                            }}
                        }}""")

        client = self.get_connection()
        result = client.execute(mutation)
        if result:
            try:
                output = result.get('data', {}).get('aiNotificationsCreateDestination', {})
                return output
            except Exception as e:
                logger.error(f"NewRelic create_r2d2_webhook_destination error: {e}")
                raise e
        return None

    def get_issue_details(self, issue_id):
        query = gql(f"""
                    {{
                        actor {{
                            account(id: {self.nr_account_id}) {{
                                aiIssues {{
                                    issues(filter: {{ids: \"{issue_id}\" }}) {{
                                        issues {{
                                            conditionFamilyId
                                            conditionName
                                            entityGuids
                                            incidentIds
                                        }}
                                    }}
                                }}
                            }}
                        }}
                    }}
                """)

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('account', {}).get('aiIssues', {}).get('issues', {}).get('issues',
                                                                                                              [])
                return output
        except Exception as e:
            logger.error(f"NewRelic get_issue_details error: {e}")
            raise e
        return None

    def get_incident_details(self, incident_id):
        query = gql(f"""
                    {{
                        actor {{
                            account(id: {self.nr_account_id}) {{
                                aiIssues {{
                                    incidents(filter: {{ids: \"{incident_id}\" }}) {{
                                        incidents {{
                                            description
                                            entityNames
                                            entityTypes
                                            title
                                        }}
                                    }}
                                }}
                            }}
                        }}
                    }}
                """)

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('account', {}).get('aiIssues', {}).get('incidents', {}).get(
                    'incidents', [])
                return output
        except Exception as e:
            logger.error(f"NewRelic get_incident_details error: {e}")
            raise e
        return None

    def get_condition_details(self, condition_id):
        query = gql(f"""
                    {{
                        actor {{
                            account(id: {self.nr_account_id}) {{
                                alerts {{
                                    nrqlCondition(id: {condition_id}) {{
                                          name
                                          nrql {{
                                              query
                                          }}
                                          policyId
                                          type
                                          description
                                    }}
                                }}
                            }}
                        }}
                    }}
                """)

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('account', {}).get('alerts', {}).get('nrqlCondition', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic get_condition_details error: {e}")
            raise e
        return None

    def get_policy_details(self, policy_id):
        query = gql(f"""
                    {{
                        actor {{
                            account(id: {self.nr_account_id}) {{
                                alerts {{
                                    policy(id: {policy_id}) {{
                                      incidentPreference
                                      name
                                    }}
                                }}
                            }}
                        }}
                    }}
                """)

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('account', {}).get('alerts', {}).get('policy', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic get_policy_details error: {e}")
            raise e
        return None

    def get_entity_details(self, entity_guid):
        query = gql(f"""
                    {{
                        actor {{
                            entity(guid: "{entity_guid}") {{
                              name
                              tags {{
                                key
                                values
                              }}
                              type
                            }}
                        }}
                    }}
                """)

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('entity', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic get_entity_details error: {e}")
            raise e
        return None

    def get_entity_related_entities_details(self, entity_guid):
        query = gql(f"""
                    {{   
                        actor {{
                            entity(guid: "{entity_guid}") {{
                                relatedEntities(cursor: "") {{
                                    results {{
                                        source {{
                                            entity {{
                                                guid
                                                entityType
                                                goldenMetrics {{
                                                    metrics {{
                                                        metricName
                                                        query
                                                        originalQueries {{
                                                            query
                                                            selectorValue
                                                        }}
                                                    }}
                                                }}
                                                goldenTags {{
                                                    tags {{
                                                        key
                                                    }}
                                                }}
                                                name
                                                tags {{
                                                    key
                                                    values
                                                }}
                                                type
                                            }}
                                        }}
                                        type
                                        target {{
                                            entity {{
                                                guid
                                                entityType
                                                goldenMetrics {{
                                                    metrics {{
                                                        query
                                                        metricName
                                                        originalQueries {{
                                                            query
                                                            selectorValue
                                                        }}
                                                    }}
                                                }}
                                                goldenTags {{
                                                    tags {{
                                                        key
                                                    }}
                                                }}
                                                name
                                                tags {{
                                                    key
                                                    values
                                                }}
                                                type
                                            }}
                                        }}
                                    }}
                                    nextCursor
                                }}
                                entityType
                                name
                                goldenMetrics {{
                                    metrics {{
                                        metricName
                                        query
                                        originalQueries {{
                                            selectorValue
                                            query
                                        }}
                                    }}
                                }}
                                goldenTags {{
                                    tags {{
                                        key
                                    }}
                                }}
                                tags {{
                                    values
                                    key
                                }}
                                type
                            }}
                        }}
                    }}
        """)

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('entity', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic get_entity_related_entities_details error: {e}")
            raise e
        return None

    def execute_nrql_query(self, query):
        query = gql(f"""{{
                                actor {{
                                    account(id: {self.nr_account_id}) {{
                                        nrql(query: "{query}") {{
                                            metadata {{
                                                eventTypes
                                                facets
                                                messages
                                                timeWindow {{
                                                    begin
                                                    compareWith
                                                    end
                                                    since
                                                    until
                                                }}
                                            }}
                                            nrql
                                            otherResult
                                            previousResults
                                            rawResponse
                                            results
                                            totalResult
                                        }}
                                    }}
                                }}
                            }}
                        """)

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('account', {}).get('nrql', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic execute_nrql_query error: {e}")
            raise e

    def get_all_policies(self, cursor):
        if cursor is not None and cursor != 'null':
            cursor = f'"{cursor}"'
        query = gql(f"""{{
                            actor {{
                                account(id: {self.nr_account_id}) {{
                                    alerts {{
                                        policiesSearch(cursor: {cursor}) {{
                                            nextCursor
                                            policies {{
                                                id
                                                incidentPreference
                                                name
                                            }}
                                            totalCount
                                        }}
                                    }}
                                }}
                            }}
                    }}""")

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('account', {}).get('alerts', {}).get('policiesSearch', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic get_all_policies error: {e}")
            raise e
        return None

    def get_all_conditions(self, cursor):
        if cursor is not None and cursor != 'null':
            cursor = f'"{cursor}"'
        query = gql(f"""{{
                            actor {{
                                account(id: {self.nr_account_id}) {{
                                    alerts {{
                                        nrqlConditionsSearch(cursor: {cursor}) {{
                                            nextCursor
                                            nrqlConditions {{
                                                description
                                                enabled
                                                entity {{
                                                    guid
                                                    name
                                                    entityType
                                                    domain
                                                    type
                                                    alertSeverity
                                                    firstIndexedAt
                                                    serviceLevel {{
                                                        indicators {{
                                                            description
                                                        }}
                                                    }}
                                                }}
                                                entityGuid
                                                expiration {{
                                                    closeViolationsOnExpiration
                                                    expirationDuration
                                                    openViolationOnExpiration
                                                }}
                                                id
                                                name
                                                nrql {{
                                                    query
                                                }}
                                                policyId
                                                runbookUrl
                                                signal {{
                                                    aggregationDelay
                                                    aggregationMethod
                                                    aggregationWindow
                                                    evaluationDelay
                                                    fillOption
                                                    slideBy
                                                    fillValue
                                                    aggregationTimer
                                                }}
                                                terms {{
                                                    operator
                                                    priority
                                                    threshold
                                                    thresholdDuration
                                                    thresholdOccurrences
                                                }}
                                                type
                                                updatedAt
                                                violationTimeLimitSeconds
                                            }}
                                            totalCount
                                        }}
                                    }}
                                }}
                            }}
                        }}""")

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('account', {}).get('alerts', {}).get('nrqlConditionsSearch', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic get_all_conditions error: {e}")
            raise e
        return None

    def get_all_entities(self, cursor, types):
        if cursor is not None and cursor != 'null':
            cursor = f'"{cursor}"'

        types_query = " OR ".join([f"type = '{item}'" for item in types])
        types_query = f'"{types_query}"'

        query = gql(f"""{{
                            actor {{
                                accounts(scope: IN_REGION) {{
                                    id
                                    name
                                }}
                                entitySearch(
                                    query: {types_query}
                                ) {{
                                results(cursor: {cursor}) {{
                                    entities {{
                                        domain
                                        entityType
                                        type
                                        name
                                        alertSeverity
                                        firstIndexedAt
                                        goldenMetrics {{
                                            context {{
                                                guid
                                                account
                                            }}
                                            metrics {{
                                                definition {{
                                                    eventId
                                                    eventObjectId
                                                    facet
                                                    from
                                                    select
                                                    where
                                                }}
                                            metricName
                                            name
                                            originalDefinitions {{
                                                definition {{
                                                    eventId
                                                    eventObjectId
                                                    facet
                                                    select
                                                    from
                                                    where
                                                }}
                                                selectorValue
                                            }}
                                            originalQueries {{
                                                query
                                                selectorValue
                                            }}
                                            query
                                            title
                                            unit
                                        }}
                                    }}
                                    account {{
                                        id
                                        name
                                        reportingEventTypes
                                    }}
                                    goldenTags {{
                                        context {{
                                            guid
                                            account
                                        }}
                                        tags {{
                                            key
                                        }}
                                    }}
                                    guid
                                    indexedAt
                                    lastReportingChangeAt
                                    permalink
                                    reporting
                                    serviceLevel {{
                                        indicators {{
                                            createdAt
                                            description
                                            entityGuid
                                            events {{
                                                badEvents {{
                                                    from
                                                    select {{
                                                        attribute
                                                        function
                                                        threshold
                                                    }}
                                                    where
                                                }}
                                                validEvents {{
                                                    from
                                                    select {{
                                                        attribute
                                                        function
                                                        threshold
                                                    }}
                                                    where
                                                }}
                                                goodEvents {{
                                                    from
                                                    select {{
                                                        function
                                                        threshold
                                                        attribute
                                                    }}
                                                    where
                                                }}
                                            }}
                                            guid
                                            id
                                            name
                                            objectives {{
                                                description
                                                name
                                                resultQueries {{
                                                    attainment {{
                                                        nrql
                                                    }}
                                                }}
                                                target
                                                timeWindow {{
                                                    rolling {{
                                                        count
                                                        unit
                                                    }}
                                                }}
                                            }}
                                            resultQueries {{
                                                goodEvents {{
                                                    nrql
                                                }}
                                                indicator {{
                                                    nrql
                                                }}
                                                validEvents {{
                                                    nrql
                                                }}
                                            }}
                                            updatedAt
                                        }}
                                    }}
                                    tags {{
                                        key
                                        values
                                    }}
                                }}
                                nextCursor
                            }}
                            types {{
                                count
                                domain
                                entityType
                                type
                            }}
                        }}
                    }}
                }}""")

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('entitySearch', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic get_all_entities error: {e}")
            raise e
        return None

    def get_all_dashboard_entities(self, dashboard_entity_guids):
        dashboard_entity_guids_query = json.dumps(dashboard_entity_guids)
        query = gql(f"""{{
                            actor {{
                                entities(guids: {dashboard_entity_guids_query}) {{
                                ... on DashboardEntity {{
                                        guid
                                        name
                                        domain
                                        entityType
                                        deploymentSearch {{
                                            results {{
                                                changelog
                                                commit
                                                deepLink
                                                deploymentId
                                                deploymentType
                                                description
                                                entityGuid
                                                groupId
                                                timestamp
                                                user
                                                version
                                            }}
                                        }}
                                        alertSeverity
                                        createdAt
                                        dashboardParentGuid
                                        description
                                        firstIndexedAt
                                        goldenMetrics {{
                                            metrics {{
                                                metricName
                                                definition {{
                                                    eventId
                                                    eventObjectId
                                                    facet
                                                    from
                                                    select
                                                    where
                                                }}
                                                name
                                                originalQueries {{
                                                    query
                                                    selectorValue
                                                }}
                                                originalDefinitions {{
                                                    selectorValue
                                                    definition {{
                                                        eventId
                                                        eventObjectId
                                                        facet
                                                        from
                                                        select
                                                        where
                                                    }}
                                                }}
                                                query
                                                title
                                                unit
                                            }}
                                        }}
                                        goldenTags {{
                                            tags {{
                                                key
                                            }}
                                        }}
                                        indexedAt
                                        lastReportingChangeAt
                                        owner {{
                                            userId
                                            email
                                        }}
                                        pages {{
                                            createdAt
                                            description
                                            guid
                                            name
                                            owner {{
                                                email
                                                userId
                                            }}
                                            updatedAt
                                            widgets {{
                                                configuration {{
                                                    area {{
                                                        nrqlQueries {{
                                                            query
                                                        }}
                                                    }}
                                                    bar {{
                                                        nrqlQueries {{
                                                            query
                                                        }}
                                                    }}
                                                    billboard {{
                                                        thresholds {{
                                                            value
                                                            alertSeverity
                                                        }}
                                                    }}
                                                    line {{
                                                        nrqlQueries {{
                                                            query
                                                        }}
                                                    }}
                                                    markdown {{
                                                        text
                                                    }}
                                                    pie {{
                                                        nrqlQueries {{
                                                            query
                                                        }}
                                                    }}
                                                    table {{
                                                        nrqlQueries {{
                                                            query
                                                        }}
                                                    }}
                                                }}
                                                id
                                                linkedEntities {{
                                                    domain
                                                    entityType
                                                    firstIndexedAt
                                                    guid
                                                    name
                                                    type
                                                }}
                                                layout {{
                                                    column
                                                    height
                                                    row
                                                    width
                                                }}
                                                rawConfiguration
                                                title
                                                visualization {{
                                                    id
                                                }}
                                            }}
                                        }}
                                        permalink
                                        permissions
                                        variables {{
                                            nrqlQuery {{
                                                query
                                            }}
                                            defaultValues {{
                                                value {{
                                                    string
                                                }}
                                            }}
                                            isMultiSelection
                                            items {{
                                                title
                                                value
                                            }}
                                            name
                                            replacementStrategy
                                            options {{
                                                ignoreTimeRange
                                            }}
                                            title
                                            type
                                        }}
                                        reporting
                                        type
                                        updatedAt
                                        tagsWithMetadata {{
                                            key
                                            values {{
                                                mutable
                                                value
                                            }}
                                        }}
                                        tags {{
                                            key
                                            values
                                        }}
                                    }}
                                }}
                            }}
                        }}""")

        try:
            client = self.get_connection()
            result = client.execute(query)
            if result:
                output = result.get('actor', {}).get('entities', {})
                return output
        except Exception as e:
            logger.error(f"NewRelic get_all_dashboard_entities error: {e}")
            raise e
        return None
