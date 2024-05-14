from datetime import timezone
from django.contrib.sites.models import Site as DjangoSite
from django.db import models

from protos.base_pb2 import Source as ConnectorType, SourceKeyType as ConnectorKeyType
from utils.model_utils import generate_choices

from google.protobuf.wrappers_pb2 import StringValue, BoolValue, UInt64Value

from accounts.models import Account

from protos.connectors.connector_pb2 import Connector as ConnectorProto, ConnectorKey as ConnectorKeyProto, \
    ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, PeriodicRunStatus

integrations_connector_type_display_name_map = {
    ConnectorType.SLACK: 'SLACK',
    ConnectorType.GOOGLE_CHAT: 'Google Chat',
    ConnectorType.SENTRY: 'SENTRY',
    ConnectorType.NEW_RELIC: 'NEW RELIC',
    ConnectorType.DATADOG: 'DATADOG',
    ConnectorType.DATADOG_OAUTH: 'DATADOG',
    ConnectorType.GRAFANA: 'GRAFANA',
    ConnectorType.GRAFANA_VPC: 'GRAFANA VPC',
    ConnectorType.GITHUB_ACTIONS: 'GITHUB ACTIONS',
    ConnectorType.ELASTIC_APM: 'ELASTIC APM',
    ConnectorType.VICTORIA_METRICS: 'VictoriaMetrics',
    ConnectorType.PROMETHEUS: 'PROMETHEUS',
    ConnectorType.CLOUDWATCH: 'CLOUDWATCH',
    ConnectorType.GCM: 'GOOGLE CLOUD MONITORING',
    ConnectorType.CLICKHOUSE: 'CLICKHOUSE',
    ConnectorType.POSTGRES: 'POSTGRES',
    ConnectorType.PAGER_DUTY: 'PAGERDUTY',
    ConnectorType.OPS_GENIE: 'OPS GENIE',
    ConnectorType.EKS: 'EKS KUBERNETES',
    ConnectorType.SQL_DATABASE_CONNECTION: 'SQL DATABASE CONNECTION',
    ConnectorType.OPEN_AI: 'OPEN AI',
    ConnectorType.REMOTE_SERVER: 'REMOTE SERVER',
}

integrations_connector_type_category_map = {
    ConnectorType.SLACK: 'Alert Channels',
    ConnectorType.GOOGLE_CHAT: 'Alert Channels',
    ConnectorType.SENTRY: 'APM Tools',
    ConnectorType.NEW_RELIC: 'APM Tools',
    ConnectorType.DATADOG: 'APM Tools',
    ConnectorType.DATADOG_OAUTH: 'APM Tools',
    ConnectorType.GRAFANA: 'APM Tools',
    ConnectorType.GRAFANA_VPC: 'APM Tools',
    ConnectorType.GITHUB_ACTIONS: 'CI/CD',
    ConnectorType.ELASTIC_APM: 'APM Tools',
    ConnectorType.VICTORIA_METRICS: 'APM Tools',
    ConnectorType.PROMETHEUS: 'APM Tools',
    ConnectorType.CLOUDWATCH: 'Cloud',
    ConnectorType.GCM: 'Cloud',
    ConnectorType.CLICKHOUSE: 'Database',
    ConnectorType.POSTGRES: 'Database',
    ConnectorType.PAGER_DUTY: 'Alert Channels',
    ConnectorType.OPS_GENIE: 'Alert Channels',
    ConnectorType.EKS: 'Cloud',
    ConnectorType.SQL_DATABASE_CONNECTION: 'Database',
    ConnectorType.OPEN_AI: 'LLM Tools',
    ConnectorType.REMOTE_SERVER: 'Remote Server',
}

integrations_connector_type_connector_keys_map = {
    ConnectorType.SLACK: [
        [
            ConnectorKeyType.SLACK_BOT_AUTH_TOKEN,
            ConnectorKeyType.SLACK_APP_ID
        ]
    ],
    ConnectorType.NEW_RELIC: [
        [
            ConnectorKeyType.NEWRELIC_API_KEY,
            ConnectorKeyType.NEWRELIC_APP_ID,
            ConnectorKeyType.NEWRELIC_API_DOMAIN
        ]
    ],
    ConnectorType.DATADOG: [
        [
            ConnectorKeyType.DATADOG_API_KEY,
            ConnectorKeyType.DATADOG_APP_KEY,
            ConnectorKeyType.DATADOG_API_DOMAIN
        ]
    ],
    ConnectorType.DATADOG_OAUTH: [
        [
            ConnectorKeyType.DATADOG_AUTH_TOKEN,
            ConnectorKeyType.DATADOG_API_DOMAIN,
            ConnectorKeyType.DATADOG_API_KEY
        ]
    ],
    ConnectorType.GRAFANA: [
        [
            ConnectorKeyType.GRAFANA_HOST,
            ConnectorKeyType.GRAFANA_API_KEY
        ]
    ],
    ConnectorType.GRAFANA_VPC: [
        [
            ConnectorKeyType.AGENT_PROXY_HOST,
            ConnectorKeyType.AGENT_PROXY_API_KEY
        ]
    ],
    ConnectorType.AGENT_PROXY: [
        [
            ConnectorKeyType.AGENT_PROXY_HOST,
            ConnectorKeyType.AGENT_PROXY_API_KEY
        ]
    ],
    ConnectorType.CLOUDWATCH: [
        [
            ConnectorKeyType.AWS_ACCESS_KEY,
            ConnectorKeyType.AWS_SECRET_KEY,
            ConnectorKeyType.AWS_REGION,
        ]
    ],
    ConnectorType.CLICKHOUSE: [
        [
            ConnectorKeyType.CLICKHOUSE_INTERFACE,
            ConnectorKeyType.CLICKHOUSE_HOST,
            ConnectorKeyType.CLICKHOUSE_PORT,
            ConnectorKeyType.CLICKHOUSE_USER,
            ConnectorKeyType.CLICKHOUSE_PASSWORD
        ]
    ],
    ConnectorType.POSTGRES: [
        [
            ConnectorKeyType.POSTGRES_HOST,
            ConnectorKeyType.POSTGRES_USER,
            ConnectorKeyType.POSTGRES_PASSWORD,
            ConnectorKeyType.POSTGRES_PORT,
            ConnectorKeyType.POSTGRES_DATABASE
        ]
    ],
    ConnectorType.EKS: [
        [
            ConnectorKeyType.AWS_ACCESS_KEY,
            ConnectorKeyType.AWS_SECRET_KEY,
            ConnectorKeyType.AWS_REGION,
            ConnectorKeyType.EKS_ROLE_ARN,
        ]
    ],
    ConnectorType.SQL_DATABASE_CONNECTION: [
        [
            ConnectorKeyType.SQL_DATABASE_CONNECTION_STRING_URI,
        ]
    ],
    ConnectorType.OPEN_AI: [
        [
            ConnectorKeyType.OPEN_AI_API_KEY,
        ]
    ],
    ConnectorType.REMOTE_SERVER: [
        [
            ConnectorKeyType.REMOTE_SERVER_USER,
            ConnectorKeyType.REMOTE_SERVER_HOST,
            ConnectorKeyType.REMOTE_SERVER_PASSWORD,
            ConnectorKeyType.REMOTE_SERVER_PEM
        ],
        [
            ConnectorKeyType.REMOTE_SERVER_USER,
            ConnectorKeyType.REMOTE_SERVER_HOST,
        ],
        [
            ConnectorKeyType.REMOTE_SERVER_USER,
            ConnectorKeyType.REMOTE_SERVER_HOST,
            ConnectorKeyType.REMOTE_SERVER_PEM
        ],
        [
            ConnectorKeyType.REMOTE_SERVER_USER,
            ConnectorKeyType.REMOTE_SERVER_HOST,
            ConnectorKeyType.REMOTE_SERVER_PASSWORD
        ]
    ]
}

integrations_connector_key_display_name_map = {
    ConnectorKeyType.SLACK_BOT_AUTH_TOKEN: 'Bot Auth Token',
    ConnectorKeyType.GOOGLE_CHAT_BOT_OAUTH_TOKEN: 'OAuth Token',
    ConnectorKeyType.SENTRY_API_KEY: 'API Key',
    ConnectorKeyType.SENTRY_ORG_SLUG: 'Org Slug',
    ConnectorKeyType.NEWRELIC_API_KEY: 'API Key',
    ConnectorKeyType.NEWRELIC_APP_ID: 'Account ID',
    ConnectorKeyType.NEWRELIC_API_DOMAIN: 'API Domain',
    ConnectorKeyType.DATADOG_API_KEY: 'API Key',
    ConnectorKeyType.DATADOG_APP_KEY: 'App Key',
    ConnectorKeyType.DATADOG_API_DOMAIN: 'API Domain',
    ConnectorKeyType.DATADOG_AUTH_TOKEN: 'OAuth Token',
    ConnectorKeyType.GRAFANA_HOST: 'Host',
    ConnectorKeyType.GRAFANA_API_KEY: 'API Key',
    ConnectorKeyType.AGENT_PROXY_HOST: 'Doctor Droid Agent Host',
    ConnectorKeyType.AGENT_PROXY_API_KEY: 'Doctor Droid API Token',
    ConnectorKeyType.GITHUB_ACTIONS_TOKEN: 'Token',
    ConnectorKeyType.AWS_ACCESS_KEY: 'AWS Access Key',
    ConnectorKeyType.AWS_SECRET_KEY: 'AWS Secret Key',
    ConnectorKeyType.AWS_REGION: 'AWS Region',
    ConnectorKeyType.GCM_PROJECT_ID: 'Project ID',
    ConnectorKeyType.GCM_PRIVATE_KEY: 'Private Key',
    ConnectorKeyType.GCM_CLIENT_EMAIL: 'Client Email',
    ConnectorKeyType.GCM_TOKEN_URI: 'Token URI',
    ConnectorKeyType.CLICKHOUSE_INTERFACE: 'Interface',
    ConnectorKeyType.CLICKHOUSE_HOST: 'Host',
    ConnectorKeyType.CLICKHOUSE_PORT: 'Port',
    ConnectorKeyType.CLICKHOUSE_USER: 'User',
    ConnectorKeyType.CLICKHOUSE_PASSWORD: 'Password',
    ConnectorKeyType.POSTGRES_HOST: 'Host',
    ConnectorKeyType.POSTGRES_USER: 'DB User',
    ConnectorKeyType.POSTGRES_PASSWORD: 'Password',
    ConnectorKeyType.POSTGRES_PORT: 'Port',
    ConnectorKeyType.POSTGRES_DATABASE: 'Database',
    ConnectorKeyType.PAGER_DUTY_API_KEY: 'API Key',
    ConnectorKeyType.OPS_GENIE_API_KEY: 'API Key',
    ConnectorKeyType.EKS_ROLE_ARN: 'EKS Role ARN',
    ConnectorKeyType.SLACK_APP_ID: 'App ID',
    ConnectorKeyType.SQL_DATABASE_CONNECTION_STRING_URI: 'Sql Database Connection URI',
    ConnectorKeyType.OPEN_AI_API_KEY: 'API Key',
    ConnectorKeyType.REMOTE_SERVER_PEM: 'PEM',
    ConnectorKeyType.REMOTE_SERVER_USER: 'User',
    ConnectorKeyType.REMOTE_SERVER_HOST: 'Host',
    ConnectorKeyType.REMOTE_SERVER_PASSWORD: 'Password'
}


class Connector(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    connector_type = models.IntegerField(null=True, blank=True, choices=generate_choices(ConnectorType),
                                         default=ConnectorType.UNKNOWN)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    created_by = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = [['account', 'name', 'connector_type']]

    def __str__(self):
        return f'{self.account}:{self.connector_type}:{self.name}'

    @property
    def proto(self) -> ConnectorProto:
        return ConnectorProto(
            id=UInt64Value(value=self.id),
            type=self.connector_type,
            is_active=BoolValue(value=self.is_active),
            name=StringValue(value=self.name),
            created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
            updated_at=int(self.updated_at.replace(tzinfo=timezone.utc).timestamp()),
            created_by=StringValue(value=self.created_by),
            display_name=StringValue(value=integrations_connector_type_display_name_map.get(self.connector_type, '')),
            category=StringValue(value=integrations_connector_type_category_map.get(self.connector_type, '')),
        )


class ConnectorKey(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE)
    key_type = models.IntegerField(null=True, blank=True, choices=generate_choices(ConnectorKeyType),
                                   default=ConnectorKeyType.UNKNOWN_SKT)
    key = models.TextField()
    metadata = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        unique_together = [['account', 'connector', 'key_type', 'key']]

    @property
    def get_proto(self):
        if self.key_type in [ConnectorKeyType.DATADOG_APP_KEY, ConnectorKeyType.DATADOG_API_KEY,
                             ConnectorKeyType.NEWRELIC_API_KEY, ConnectorKeyType.NEWRELIC_APP_ID,
                             ConnectorKeyType.NEWRELIC_QUERY_KEY,
                             ConnectorKeyType.SLACK_BOT_AUTH_TOKEN,
                             ConnectorKeyType.HONEYBADGER_USERNAME,
                             ConnectorKeyType.HONEYBADGER_PASSWORD,
                             ConnectorKeyType.HONEYBADGER_PROJECT_ID, ConnectorKeyType.AWS_ACCESS_KEY,
                             ConnectorKeyType.AWS_SECRET_KEY, ConnectorKeyType.DATADOG_AUTH_TOKEN,
                             ConnectorKeyType.GOOGLE_CHAT_BOT_OAUTH_TOKEN,
                             ConnectorKeyType.GRAFANA_API_KEY,
                             ConnectorKeyType.AGENT_PROXY_API_KEY,
                             ConnectorKeyType.GITHUB_ACTIONS_TOKEN,
                             ConnectorKeyType.AGENT_PROXY_HOST,
                             ConnectorKeyType.AWS_ASSUMED_ROLE_ARN,
                             ConnectorKeyType.CLICKHOUSE_USER, ConnectorKeyType.CLICKHOUSE_PASSWORD,
                             ConnectorKeyType.GCM_PROJECT_ID, ConnectorKeyType.GCM_PRIVATE_KEY,
                             ConnectorKeyType.GCM_CLIENT_EMAIL, ConnectorKeyType.PAGER_DUTY_API_KEY,
                             ConnectorKeyType.POSTGRES_PASSWORD, ConnectorKeyType.POSTGRES_USER,
                             ConnectorKeyType.GRAFANA_API_KEY,
                             ConnectorKeyType.OPS_GENIE_API_KEY,
                             ConnectorKeyType.OPEN_AI_API_KEY,
                             ConnectorKeyType.REMOTE_SERVER_PASSWORD,
                             ConnectorKeyType.REMOTE_SERVER_PEM]:
            key_value = '*********' + self.key[-4:]
            return ConnectorKeyProto(key_type=self.key_type,
                                     key=StringValue(value=key_value),
                                     is_active=BoolValue(value=self.is_active),
                                     connector_id=UInt64Value(value=self.connector_id),
                                     created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
                                     updated_at=int(self.updated_at.replace(tzinfo=timezone.utc).timestamp()),
                                     display_name=StringValue(
                                         value=integrations_connector_key_display_name_map.get(self.key_type, '')))

        return ConnectorKeyProto(key_type=self.key_type,
                                 key=StringValue(value=self.key),
                                 is_active=BoolValue(value=self.is_active),
                                 connector_id=UInt64Value(value=self.connector_id),
                                 created_at=int(self.created_at.replace(tzinfo=timezone.utc).timestamp()),
                                 updated_at=int(self.updated_at.replace(tzinfo=timezone.utc).timestamp()),
                                 display_name=StringValue(
                                     value=integrations_connector_key_display_name_map.get(self.key_type, '')))

    @property
    def get_unmasked_proto(self):
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
    connector_type = models.IntegerField(choices=generate_choices(ConnectorType), default=ConnectorType.UNKNOWN,
                                         db_index=True)
    model_type = models.IntegerField(choices=generate_choices(ConnectorMetadataModelTypeProto),
                                     default=ConnectorMetadataModelTypeProto.UNKNOWN_MT, db_index=True)

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
