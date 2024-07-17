from datetime import timezone
from hashlib import md5

from django.contrib.sites.models import Site as DjangoSite
from django.db import models

from protos.base_pb2 import Source, SourceKeyType, SourceModelType
from utils.model_utils import generate_choices

from google.protobuf.wrappers_pb2 import StringValue, BoolValue, UInt64Value

from accounts.models import Account

from protos.connectors.connector_pb2 import Connector as ConnectorProto, ConnectorKey as ConnectorKeyProto, \
    PeriodicRunStatus

integrations_connector_type_display_name_map = {
    Source.SLACK: 'SLACK',
    Source.GOOGLE_CHAT: 'Google Chat',
    Source.SENTRY: 'SENTRY',
    Source.NEW_RELIC: 'NEW RELIC',
    Source.DATADOG: 'DATADOG',
    Source.DATADOG_OAUTH: 'DATADOG',
    Source.GRAFANA: 'GRAFANA',
    Source.GRAFANA_VPC: 'GRAFANA VPC',
    Source.GITHUB_ACTIONS: 'GITHUB ACTIONS',
    Source.ELASTIC_APM: 'ELASTIC APM',
    Source.VICTORIA_METRICS: 'VictoriaMetrics',
    Source.PROMETHEUS: 'PROMETHEUS',
    Source.CLOUDWATCH: 'CLOUDWATCH',
    Source.GCM: 'GOOGLE CLOUD MONITORING',
    Source.CLICKHOUSE: 'CLICKHOUSE',
    Source.POSTGRES: 'POSTGRES',
    Source.PAGER_DUTY: 'PAGERDUTY',
    Source.OPS_GENIE: 'OPS GENIE',
    Source.EKS: 'EKS KUBERNETES',
    Source.SQL_DATABASE_CONNECTION: 'SQL DATABASE CONNECTION',
    Source.OPEN_AI: 'OPEN AI',
    Source.REMOTE_SERVER: 'REMOTE SERVER',
    Source.GRAFANA_MIMIR: 'GRAFANA MIMIR',
    Source.AZURE: 'AZURE',
    Source.GKE: 'GKE KUBERNETES',
    Source.MS_TEAMS: 'MS TEAMS',
    Source.ELASTIC_SEARCH: 'ELASTIC SEARCH',
    Source.GRAFANA_LOKI: 'GRAFANA LOKI',
    Source.KUBERNETES: 'KUBERNETES',
}

integrations_connector_type_category_map = {
    Source.SLACK: 'Alert Channels',
    Source.GOOGLE_CHAT: 'Alert Channels',
    Source.PAGER_DUTY: 'Alert Channels',
    Source.OPS_GENIE: 'Alert Channels',
    Source.MS_TEAMS: 'Alert Channels',
    Source.SENTRY: 'APM Tools',
    Source.NEW_RELIC: 'APM Tools',
    Source.DATADOG: 'APM Tools',
    Source.DATADOG_OAUTH: 'APM Tools',
    Source.GRAFANA: 'APM Tools',
    Source.GRAFANA_VPC: 'APM Tools',
    Source.ELASTIC_APM: 'APM Tools',
    Source.VICTORIA_METRICS: 'APM Tools',
    Source.PROMETHEUS: 'APM Tools',
    Source.GRAFANA_MIMIR: 'APM Tools',
    Source.ELASTIC_SEARCH: 'APM Tools',
    Source.GRAFANA_LOKI: 'APM Tools',
    Source.GITHUB_ACTIONS: 'CI/CD',
    Source.CLOUDWATCH: 'Cloud',
    Source.GCM: 'Cloud',
    Source.EKS: 'Cloud',
    Source.AZURE: 'Cloud',
    Source.GKE: 'Cloud',
    Source.CLICKHOUSE: 'Database',
    Source.POSTGRES: 'Database',
    Source.SQL_DATABASE_CONNECTION: 'Database',
    Source.OPEN_AI: 'LLM Tools',
    Source.REMOTE_SERVER: 'Remote Server',
    Source.KUBERNETES: 'Cloud',
}

integrations_connector_type_connector_keys_map = {
    Source.PAGER_DUTY: [
        [
            SourceKeyType.PAGER_DUTY_API_KEY,
            SourceKeyType.PAGER_DUTY_CONFIGURED_EMAIL
        ]
    ],
    Source.SLACK: [
        [
            SourceKeyType.SLACK_BOT_AUTH_TOKEN,
            SourceKeyType.SLACK_APP_ID
        ]
    ],
    Source.NEW_RELIC: [
        [
            SourceKeyType.NEWRELIC_API_KEY,
            SourceKeyType.NEWRELIC_APP_ID,
            SourceKeyType.NEWRELIC_API_DOMAIN
        ]
    ],
    Source.DATADOG: [
        [
            SourceKeyType.DATADOG_API_KEY,
            SourceKeyType.DATADOG_APP_KEY,
            SourceKeyType.DATADOG_API_DOMAIN
        ]
    ],
    Source.DATADOG_OAUTH: [
        [
            SourceKeyType.DATADOG_AUTH_TOKEN,
            SourceKeyType.DATADOG_API_DOMAIN,
            SourceKeyType.DATADOG_API_KEY
        ]
    ],
    Source.GRAFANA: [
        [
            SourceKeyType.GRAFANA_HOST,
            SourceKeyType.GRAFANA_API_KEY,
            SourceKeyType.SSL_VERIFY,
        ],
        [
            SourceKeyType.GRAFANA_HOST,
            SourceKeyType.GRAFANA_API_KEY
        ]
    ],
    Source.GRAFANA_VPC: [
        [
            SourceKeyType.AGENT_PROXY_HOST,
            SourceKeyType.AGENT_PROXY_API_KEY
        ]
    ],
    Source.AGENT_PROXY: [
        [
            SourceKeyType.AGENT_PROXY_HOST,
            SourceKeyType.AGENT_PROXY_API_KEY
        ]
    ],
    Source.CLOUDWATCH: [
        [
            SourceKeyType.AWS_ACCESS_KEY,
            SourceKeyType.AWS_SECRET_KEY,
            SourceKeyType.AWS_REGION,
        ]
    ],
    Source.CLICKHOUSE: [
        [
            SourceKeyType.CLICKHOUSE_INTERFACE,
            SourceKeyType.CLICKHOUSE_HOST,
            SourceKeyType.CLICKHOUSE_PORT,
            SourceKeyType.CLICKHOUSE_USER,
            SourceKeyType.CLICKHOUSE_PASSWORD
        ]
    ],
    Source.POSTGRES: [
        [
            SourceKeyType.POSTGRES_HOST,
            SourceKeyType.POSTGRES_USER,
            SourceKeyType.POSTGRES_PASSWORD,
            SourceKeyType.POSTGRES_PORT,
            SourceKeyType.POSTGRES_DATABASE
        ]
    ],
    Source.EKS: [
        [
            SourceKeyType.AWS_ACCESS_KEY,
            SourceKeyType.AWS_SECRET_KEY,
            SourceKeyType.AWS_REGION,
            SourceKeyType.EKS_ROLE_ARN,
        ]
    ],
    Source.SQL_DATABASE_CONNECTION: [
        [
            SourceKeyType.SQL_DATABASE_CONNECTION_STRING_URI,
        ]
    ],
    Source.OPEN_AI: [
        [
            SourceKeyType.OPEN_AI_API_KEY,
        ]
    ],
    Source.GRAFANA_MIMIR: [
        [
            SourceKeyType.MIMIR_HOST,
            SourceKeyType.X_SCOPE_ORG_ID,
            SourceKeyType.SSL_VERIFY,
        ],
        [
            SourceKeyType.MIMIR_HOST,
            SourceKeyType.X_SCOPE_ORG_ID
        ]
    ],
    Source.REMOTE_SERVER: [
        [
            SourceKeyType.REMOTE_SERVER_HOST,
            SourceKeyType.REMOTE_SERVER_PEM,
            SourceKeyType.REMOTE_SERVER_PASSWORD,
        ],
        [
            SourceKeyType.REMOTE_SERVER_HOST,
        ],
        [
            SourceKeyType.REMOTE_SERVER_HOST,
            SourceKeyType.REMOTE_SERVER_PEM
        ],
        [
            SourceKeyType.REMOTE_SERVER_HOST,
            SourceKeyType.REMOTE_SERVER_PASSWORD
        ],
        [
        ]
    ],
    Source.AZURE: [
        [
            SourceKeyType.AZURE_CLIENT_ID,
            SourceKeyType.AZURE_CLIENT_SECRET,
            SourceKeyType.AZURE_TENANT_ID,
            SourceKeyType.AZURE_SUBSCRIPTION_ID,
        ]
    ],
    Source.GKE: [
        [
            SourceKeyType.GKE_PROJECT_ID,
            SourceKeyType.GKE_SERVICE_ACCOUNT_JSON,
        ]
    ],
    Source.MS_TEAMS: [
        [
            SourceKeyType.MS_TEAMS_CONNECTOR_WEBHOOK_URL,
        ]
    ],
    Source.ELASTIC_SEARCH: [
        [
            SourceKeyType.ELASTIC_SEARCH_PROTOCOL,
            SourceKeyType.ELASTIC_SEARCH_HOST,
            SourceKeyType.ELASTIC_SEARCH_PORT,
            SourceKeyType.ELASTIC_SEARCH_API_KEY_ID,
            SourceKeyType.ELASTIC_SEARCH_API_KEY,
            SourceKeyType.SSL_VERIFY,
        ],
        [
            SourceKeyType.ELASTIC_SEARCH_PROTOCOL,
            SourceKeyType.ELASTIC_SEARCH_HOST,
            SourceKeyType.ELASTIC_SEARCH_API_KEY_ID,
            SourceKeyType.ELASTIC_SEARCH_API_KEY,
        ],
        [
            SourceKeyType.ELASTIC_SEARCH_HOST,
        ]
    ],
    Source.GRAFANA_LOKI: [
        [
            SourceKeyType.GRAFANA_LOKI_PROTOCOL,
            SourceKeyType.GRAFANA_LOKI_HOST,
            SourceKeyType.GRAFANA_LOKI_PORT,
            SourceKeyType.X_SCOPE_ORG_ID,
            SourceKeyType.SSL_VERIFY
        ],
        [
            SourceKeyType.GRAFANA_LOKI_PROTOCOL,
            SourceKeyType.GRAFANA_LOKI_HOST,
            SourceKeyType.GRAFANA_LOKI_PORT,
            SourceKeyType.X_SCOPE_ORG_ID
        ]
    ],
    Source.KUBERNETES: [
        [
            SourceKeyType.KUBERNETES_CLUSTER_NAME,
            SourceKeyType.KUBERNETES_CLUSTER_API_SERVER,
            SourceKeyType.KUBERNETES_CLUSTER_TOKEN,
            SourceKeyType.KUBERNETES_CLUSTER_CERTIFICATE_AUTHORITY_DATA
        ]
    ],
}

integrations_connector_key_display_name_map = {
    SourceKeyType.SLACK_BOT_AUTH_TOKEN: 'Bot Auth Token',
    SourceKeyType.GOOGLE_CHAT_BOT_OAUTH_TOKEN: 'OAuth Token',
    SourceKeyType.SENTRY_API_KEY: 'API Key',
    SourceKeyType.SENTRY_ORG_SLUG: 'Org Slug',
    SourceKeyType.NEWRELIC_API_KEY: 'API Key',
    SourceKeyType.NEWRELIC_APP_ID: 'Account ID',
    SourceKeyType.NEWRELIC_API_DOMAIN: 'API Domain',
    SourceKeyType.DATADOG_API_KEY: 'API Key',
    SourceKeyType.DATADOG_APP_KEY: 'App Key',
    SourceKeyType.DATADOG_API_DOMAIN: 'API Domain',
    SourceKeyType.DATADOG_AUTH_TOKEN: 'OAuth Token',
    SourceKeyType.GRAFANA_HOST: 'Host',
    SourceKeyType.GRAFANA_API_KEY: 'API Key',
    SourceKeyType.AGENT_PROXY_HOST: 'Doctor Droid Agent Host',
    SourceKeyType.AGENT_PROXY_API_KEY: 'Doctor Droid API Token',
    SourceKeyType.GITHUB_ACTIONS_TOKEN: 'Token',
    SourceKeyType.AWS_ACCESS_KEY: 'AWS Access Key',
    SourceKeyType.AWS_SECRET_KEY: 'AWS Secret Key',
    SourceKeyType.AWS_REGION: 'AWS Region',
    SourceKeyType.GCM_PROJECT_ID: 'Project ID',
    SourceKeyType.GCM_PRIVATE_KEY: 'Private Key',
    SourceKeyType.GCM_CLIENT_EMAIL: 'Client Email',
    SourceKeyType.GCM_TOKEN_URI: 'Token URI',
    SourceKeyType.CLICKHOUSE_INTERFACE: 'Interface',
    SourceKeyType.CLICKHOUSE_HOST: 'Host',
    SourceKeyType.CLICKHOUSE_PORT: 'Port',
    SourceKeyType.CLICKHOUSE_USER: 'User',
    SourceKeyType.CLICKHOUSE_PASSWORD: 'Password',
    SourceKeyType.POSTGRES_HOST: 'Host',
    SourceKeyType.POSTGRES_USER: 'DB User',
    SourceKeyType.POSTGRES_PASSWORD: 'Password',
    SourceKeyType.POSTGRES_PORT: 'Port',
    SourceKeyType.POSTGRES_DATABASE: 'Database',
    SourceKeyType.PAGER_DUTY_API_KEY: 'API Key',
    SourceKeyType.PAGER_DUTY_CONFIGURED_EMAIL: 'Configured Email',
    SourceKeyType.OPS_GENIE_API_KEY: 'API Key',
    SourceKeyType.EKS_ROLE_ARN: 'EKS Role ARN',
    SourceKeyType.SLACK_APP_ID: 'App ID',
    SourceKeyType.SQL_DATABASE_CONNECTION_STRING_URI: 'Sql Database Connection URI',
    SourceKeyType.OPEN_AI_API_KEY: 'API Key',
    SourceKeyType.REMOTE_SERVER_PEM: 'PEM',
    SourceKeyType.REMOTE_SERVER_USER: 'User',
    SourceKeyType.REMOTE_SERVER_HOST: 'Host',
    SourceKeyType.REMOTE_SERVER_PASSWORD: 'Password',
    SourceKeyType.MIMIR_HOST: 'Host',
    SourceKeyType.X_SCOPE_ORG_ID: 'X-Scope-OrgId',
    SourceKeyType.SSL_VERIFY: "Enable TLS certificate validation",
    SourceKeyType.AZURE_CLIENT_ID: 'Client ID',
    SourceKeyType.AZURE_CLIENT_SECRET: 'Client Secret',
    SourceKeyType.AZURE_TENANT_ID: 'Tenant ID',
    SourceKeyType.AZURE_SUBSCRIPTION_ID: 'Subscription ID',
    SourceKeyType.GKE_PROJECT_ID: 'Project ID',
    SourceKeyType.GKE_SERVICE_ACCOUNT_JSON: 'Service Account JSON',
    SourceKeyType.MS_TEAMS_CONNECTOR_WEBHOOK_URL: 'Webhook URL',
    SourceKeyType.ELASTIC_SEARCH_HOST: 'Host',
    SourceKeyType.ELASTIC_SEARCH_PORT: 'Port',
    SourceKeyType.ELASTIC_SEARCH_API_KEY_ID: 'API Key ID',
    SourceKeyType.ELASTIC_SEARCH_API_KEY: 'API Key',
    SourceKeyType.ELASTIC_SEARCH_PROTOCOL: 'Protocol',
    SourceKeyType.GRAFANA_LOKI_HOST: 'Host',
    SourceKeyType.GRAFANA_LOKI_PORT: 'Port',
    SourceKeyType.GRAFANA_LOKI_PROTOCOL: 'Protocol',
    SourceKeyType.KUBERNETES_CLUSTER_NAME: 'Cluster Name',
    SourceKeyType.KUBERNETES_CLUSTER_API_SERVER: 'API Server URL',
    SourceKeyType.KUBERNETES_CLUSTER_TOKEN: 'Token',
    SourceKeyType.KUBERNETES_CLUSTER_CERTIFICATE_AUTHORITY_DATA: 'Certificate Authority Data',
}


class Connector(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    connector_type = models.IntegerField(null=True, blank=True, choices=generate_choices(Source),
                                         default=Source.UNKNOWN)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    created_by = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = [['account', 'name', 'connector_type']]

    def __str__(self):
        return f'{self.account}:{self.connector_type}:{self.name}'

    @property
    def proto_partial(self) -> ConnectorProto:
        connector_type_name = integrations_connector_type_display_name_map.get(self.connector_type,
                                                                               Source.Name(self.connector_type))
        display_name = f'{connector_type_name}'
        if self.name:
            display_name = f'{connector_type_name} - {self.name}'
        return ConnectorProto(
            id=UInt64Value(value=self.id),
            account_id=UInt64Value(value=self.account_id),
            type=self.connector_type,
            is_active=BoolValue(value=self.is_active),
            name=StringValue(value=self.name),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            updated_at=int(self.updated_at.replace(tzinfo=timezone.utc).timestamp()),
            created_by=StringValue(value=self.created_by),
            display_name=StringValue(value=display_name),
            category=StringValue(value=integrations_connector_type_category_map.get(self.connector_type, '')),
        )

    @property
    def proto(self) -> ConnectorProto:
        keys = self.connectorkey_set.filter(is_active=True)
        keys_proto = [key.proto for key in keys]
        connector_type_name = integrations_connector_type_display_name_map.get(self.connector_type,
                                                                               Source.Name(self.connector_type))
        display_name = f'{connector_type_name}'
        if self.name:
            display_name = f'{connector_type_name} - {self.name}'
        return ConnectorProto(
            id=UInt64Value(value=self.id),
            account_id=UInt64Value(value=self.account_id),
            type=self.connector_type,
            is_active=BoolValue(value=self.is_active),
            name=StringValue(value=self.name),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            updated_at=int(self.updated_at.replace(tzinfo=timezone.utc).timestamp()),
            created_by=StringValue(value=self.created_by),
            display_name=StringValue(value=display_name),
            category=StringValue(value=integrations_connector_type_category_map.get(self.connector_type, '')),
            keys=keys_proto
        )

    @property
    def unmasked_proto(self) -> ConnectorProto:
        keys = self.connectorkey_set.filter(is_active=True)
        keys_proto = [key.unmasked_proto for key in keys]
        connector_type_name = integrations_connector_type_display_name_map.get(self.connector_type,
                                                                               Source.Name(self.connector_type))
        display_name = f'{connector_type_name}'
        if self.name:
            display_name = f'{connector_type_name} - {self.name}'
        return ConnectorProto(
            id=UInt64Value(value=self.id),
            account_id=UInt64Value(value=self.account_id),
            type=self.connector_type,
            is_active=BoolValue(value=self.is_active),
            name=StringValue(value=self.name),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            updated_at=int(self.updated_at.replace(tzinfo=timezone.utc).timestamp()),
            created_by=StringValue(value=self.created_by),
            display_name=StringValue(value=display_name),
            category=StringValue(value=integrations_connector_type_category_map.get(self.connector_type, '')),
            keys=keys_proto
        )


class ConnectorKey(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE)
    key_type = models.IntegerField(null=True, blank=True, choices=generate_choices(SourceKeyType),
                                   default=SourceKeyType.UNKNOWN_SKT)
    key = models.TextField()
    key_md5 = models.CharField(max_length=255, null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        unique_together = [['account', 'connector', 'key_type', 'key_md5']]

    def save(self, **kwargs):
        if self.key:
            self.key_md5 = md5(str(self.key).encode('utf-8')).hexdigest()
        super().save(**kwargs)

    @property
    def proto(self):
        key_value = self.key
        if self.key_type in [SourceKeyType.DATADOG_APP_KEY, SourceKeyType.DATADOG_API_KEY,
                             SourceKeyType.NEWRELIC_API_KEY, SourceKeyType.NEWRELIC_APP_ID,
                             SourceKeyType.NEWRELIC_QUERY_KEY,
                             SourceKeyType.SLACK_BOT_AUTH_TOKEN,
                             SourceKeyType.HONEYBADGER_USERNAME,
                             SourceKeyType.HONEYBADGER_PASSWORD,
                             SourceKeyType.HONEYBADGER_PROJECT_ID, SourceKeyType.AWS_ACCESS_KEY,
                             SourceKeyType.AWS_SECRET_KEY, SourceKeyType.DATADOG_AUTH_TOKEN,
                             SourceKeyType.GOOGLE_CHAT_BOT_OAUTH_TOKEN,
                             SourceKeyType.GRAFANA_API_KEY,
                             SourceKeyType.AGENT_PROXY_API_KEY,
                             SourceKeyType.PAGER_DUTY_API_KEY,
                             SourceKeyType.GITHUB_ACTIONS_TOKEN,
                             SourceKeyType.AGENT_PROXY_HOST,
                             SourceKeyType.AWS_ASSUMED_ROLE_ARN,
                             SourceKeyType.CLICKHOUSE_USER, SourceKeyType.CLICKHOUSE_PASSWORD,
                             SourceKeyType.GCM_PROJECT_ID, SourceKeyType.GCM_PRIVATE_KEY,
                             SourceKeyType.GCM_CLIENT_EMAIL, SourceKeyType.PAGER_DUTY_API_KEY,
                             SourceKeyType.POSTGRES_PASSWORD, SourceKeyType.POSTGRES_USER,
                             SourceKeyType.OPS_GENIE_API_KEY,
                             SourceKeyType.OPEN_AI_API_KEY,
                             SourceKeyType.REMOTE_SERVER_PASSWORD,
                             SourceKeyType.REMOTE_SERVER_PEM,
                             SourceKeyType.AZURE_CLIENT_SECRET,
                             SourceKeyType.GKE_SERVICE_ACCOUNT_JSON,
                             SourceKeyType.ELASTIC_SEARCH_API_KEY_ID,
                             SourceKeyType.ELASTIC_SEARCH_API_KEY,
                             SourceKeyType.KUBERNETES_CLUSTER_TOKEN,
                             SourceKeyType.KUBERNETES_CLUSTER_CERTIFICATE_AUTHORITY_DATA, ]:
            key_value = '*********' + self.key[-4:]
        return ConnectorKeyProto(key_type=self.key_type,
                                 key=StringValue(value=key_value),
                                 is_active=BoolValue(value=self.is_active),
                                 connector_id=UInt64Value(value=self.connector_id),
                                 created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
                                 updated_at=int(self.updated_at.replace(tzinfo=timezone.utc).timestamp()),
                                 display_name=StringValue(
                                     value=integrations_connector_key_display_name_map.get(self.key_type, '')))

    @property
    def unmasked_proto(self):
        return ConnectorKeyProto(key_type=self.key_type,
                                 key=StringValue(value=self.key),
                                 is_active=BoolValue(value=self.is_active),
                                 connector_id=UInt64Value(value=self.connector_id),
                                 created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
                                 updated_at=int(self.updated_at.replace(tzinfo=timezone.utc).timestamp()),
                                 display_name=StringValue(
                                     value=integrations_connector_key_display_name_map.get(self.key_type, '')))


class ConnectorMetadataModelStore(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE, null=True, blank=True, db_index=True)
    connector_type = models.IntegerField(choices=generate_choices(Source), default=Source.UNKNOWN,
                                         db_index=True)
    model_type = models.IntegerField(choices=generate_choices(SourceModelType), default=SourceModelType.UNKNOWN_MT,
                                     db_index=True)

    model_uid = models.TextField(db_index=True)

    metadata = models.JSONField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        unique_together = [['account', 'connector', 'connector_type', 'model_type', 'model_uid']]

    def __str__(self):
        return f'{self.account}:{self.connector_type}:{self.model_type}:{self.model_uid}'


class SlackConnectorAlertType(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE)
    channel_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    alert_type = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        unique_together = [['account', 'connector', 'channel_id', 'alert_type']]


class SlackConnectorDataReceived(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE)
    slack_channel_metadata_model = models.ForeignKey(ConnectorMetadataModelStore, on_delete=models.CASCADE,
                                                     db_index=True, null=True)
    channel_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    data = models.JSONField(null=True, blank=True)

    db_alert_type = models.ForeignKey(SlackConnectorAlertType, on_delete=models.CASCADE, null=True, blank=True,
                                      db_index=True)
    alert_type = models.CharField(max_length=255, null=True, blank=True, db_index=True)

    tags = models.JSONField(null=True, blank=True)
    title = models.TextField(null=True, blank=True)
    text = models.TextField(null=True, blank=True)

    data_timestamp = models.DateTimeField(blank=True, null=True, db_index=True)
    received_at = models.DateTimeField(auto_now_add=True, db_index=True)


class ConnectorPeriodicRunMetadata(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE)
    metadata = models.JSONField()
    task_run_id = models.CharField(max_length=255)
    status = models.IntegerField(null=True, blank=True,
                                 choices=generate_choices(PeriodicRunStatus.StatusType))
    started_at = models.DateTimeField(blank=True, null=True, db_index=True)
    finished_at = models.DateTimeField(blank=True, null=True, db_index=True)


class Site(models.Model):
    domain = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    protocol = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, **kwargs):
        if self.domain:
            django_site, _ = DjangoSite.objects.get_or_create(id=1)
            django_site.domain = self.domain
            django_site.name = self.name
            django_site.save()
        super().save(**kwargs)
