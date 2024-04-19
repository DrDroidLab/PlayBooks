from datetime import timezone
from hashlib import md5
from django.db import models
from utils.model_utils import generate_choices

from google.protobuf.wrappers_pb2 import StringValue, BoolValue, UInt64Value

from accounts.models import Account

from protos.connectors.connector_pb2 import Connector as ConnectorProto, ConnectorKey as ConnectorKeyProto, \
    ConnectorType, ConnectorMetadataModelType as ConnectorMetadataModelTypeProto

integrations_request_connectors = [
    ConnectorType.ELASTIC_APM,
    ConnectorType.VICTORIA_METRICS,
    ConnectorType.PROMETHEUS
]

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
}

integrations_connector_type_connector_keys_map = {
    # ConnectorType.SLACK: [
    #     [
    #         ConnectorKeyProto.KeyType.SLACK_BOT_AUTH_TOKEN
    #     ]
    # ],
    # ConnectorType.GOOGLE_CHAT: [
    #     [
    #         ConnectorKeyProto.KeyType.GOOGLE_CHAT_BOT_OAUTH_TOKEN,
    #     ]
    # ],
    ConnectorType.SENTRY: [
        [
            ConnectorKeyProto.KeyType.SENTRY_API_KEY,
            ConnectorKeyProto.KeyType.SENTRY_ORG_SLUG
        ]
    ],
    ConnectorType.NEW_RELIC: [
        [
            ConnectorKeyProto.KeyType.NEWRELIC_API_KEY,
            ConnectorKeyProto.KeyType.NEWRELIC_APP_ID,
            ConnectorKeyProto.KeyType.NEWRELIC_API_DOMAIN
        ]
    ],
    ConnectorType.DATADOG: [
        [
            ConnectorKeyProto.KeyType.DATADOG_API_KEY,
            ConnectorKeyProto.KeyType.DATADOG_APP_KEY,
            ConnectorKeyProto.KeyType.DATADOG_API_DOMAIN
        ]
    ],
    ConnectorType.DATADOG_OAUTH: [
        [
            ConnectorKeyProto.KeyType.DATADOG_AUTH_TOKEN,
            ConnectorKeyProto.KeyType.DATADOG_API_DOMAIN,
            ConnectorKeyProto.KeyType.DATADOG_API_KEY
        ]
    ],
    ConnectorType.GRAFANA: [
        [
            ConnectorKeyProto.KeyType.GRAFANA_HOST,
            ConnectorKeyProto.KeyType.GRAFANA_API_KEY
        ]
    ],
    ConnectorType.GRAFANA_VPC: [
        [
            ConnectorKeyProto.KeyType.AGENT_PROXY_HOST,
            ConnectorKeyProto.KeyType.AGENT_PROXY_API_KEY
        ]
    ],
    ConnectorType.GITHUB_ACTIONS: [
        [
            ConnectorKeyProto.KeyType.GITHUB_ACTIONS_TOKEN,
        ]
    ],
    ConnectorType.AGENT_PROXY: [
        [
            ConnectorKeyProto.KeyType.AGENT_PROXY_HOST,
            ConnectorKeyProto.KeyType.AGENT_PROXY_API_KEY
        ]
    ],
    ConnectorType.CLOUDWATCH: [
        [
            ConnectorKeyProto.KeyType.AWS_ACCESS_KEY,
            ConnectorKeyProto.KeyType.AWS_SECRET_KEY,
            ConnectorKeyProto.KeyType.AWS_REGION,
        ]
    ],
    ConnectorType.GCM: [
        [
            ConnectorKeyProto.KeyType.GCM_PROJECT_ID,
            ConnectorKeyProto.KeyType.GCM_PRIVATE_KEY,
            ConnectorKeyProto.KeyType.GCM_CLIENT_EMAIL,
            ConnectorKeyProto.KeyType.GCM_TOKEN_URI
        ]
    ],
    ConnectorType.CLICKHOUSE: [
        [
            ConnectorKeyProto.KeyType.CLICKHOUSE_INTERFACE,
            ConnectorKeyProto.KeyType.CLICKHOUSE_HOST,
            ConnectorKeyProto.KeyType.CLICKHOUSE_PORT,
            ConnectorKeyProto.KeyType.CLICKHOUSE_USER,
            ConnectorKeyProto.KeyType.CLICKHOUSE_PASSWORD
        ]
    ],
    ConnectorType.POSTGRES: [
        [
            ConnectorKeyProto.KeyType.POSTGRES_HOST,
            ConnectorKeyProto.KeyType.POSTGRES_USER,
            ConnectorKeyProto.KeyType.POSTGRES_PASSWORD,
        ]
    ],
    ConnectorType.EKS: [
        [
            ConnectorKeyProto.KeyType.AWS_ACCESS_KEY,
            ConnectorKeyProto.KeyType.AWS_SECRET_KEY,
            ConnectorKeyProto.KeyType.AWS_REGION,
            ConnectorKeyProto.KeyType.EKS_ROLE_ARN,
        ]
    ],
    ConnectorType.PAGER_DUTY: [
        [
            ConnectorKeyProto.KeyType.PAGER_DUTY_API_KEY,
        ]
    ],
    ConnectorType.OPS_GENIE: [
        [
            ConnectorKeyProto.KeyType.OPS_GENIE_API_KEY,
        ]
    ],

}

integrations_connector_key_display_name_map = {
    ConnectorKeyProto.KeyType.SLACK_BOT_AUTH_TOKEN: 'Bot Auth Token',
    ConnectorKeyProto.KeyType.GOOGLE_CHAT_BOT_OAUTH_TOKEN: 'OAuth Token',
    ConnectorKeyProto.KeyType.SENTRY_API_KEY: 'API Key',
    ConnectorKeyProto.KeyType.SENTRY_ORG_SLUG: 'Org Slug',
    ConnectorKeyProto.KeyType.NEWRELIC_API_KEY: 'API Key',
    ConnectorKeyProto.KeyType.NEWRELIC_APP_ID: 'Account ID',
    ConnectorKeyProto.KeyType.NEWRELIC_API_DOMAIN: 'API Domain',
    ConnectorKeyProto.KeyType.DATADOG_API_KEY: 'API Key',
    ConnectorKeyProto.KeyType.DATADOG_APP_KEY: 'App Key',
    ConnectorKeyProto.KeyType.DATADOG_API_DOMAIN: 'API Domain',
    ConnectorKeyProto.KeyType.DATADOG_AUTH_TOKEN: 'OAuth Token',
    ConnectorKeyProto.KeyType.GRAFANA_HOST: 'Host',
    ConnectorKeyProto.KeyType.GRAFANA_API_KEY: 'API Key',
    ConnectorKeyProto.KeyType.AGENT_PROXY_HOST: 'Doctor Droid Agent Host',
    ConnectorKeyProto.KeyType.AGENT_PROXY_API_KEY: 'Doctor Droid API Token',
    ConnectorKeyProto.KeyType.GITHUB_ACTIONS_TOKEN: 'Token',
    ConnectorKeyProto.KeyType.AWS_ACCESS_KEY: 'AWS Access Key',
    ConnectorKeyProto.KeyType.AWS_SECRET_KEY: 'AWS Secret Key',
    ConnectorKeyProto.KeyType.AWS_REGION: 'AWS Region',
    ConnectorKeyProto.KeyType.GCM_PROJECT_ID: 'Project ID',
    ConnectorKeyProto.KeyType.GCM_PRIVATE_KEY: 'Private Key',
    ConnectorKeyProto.KeyType.GCM_CLIENT_EMAIL: 'Client Email',
    ConnectorKeyProto.KeyType.GCM_TOKEN_URI: 'Token URI',
    ConnectorKeyProto.KeyType.CLICKHOUSE_INTERFACE: 'Interface',
    ConnectorKeyProto.KeyType.CLICKHOUSE_HOST: 'Host',
    ConnectorKeyProto.KeyType.CLICKHOUSE_PORT: 'Port',
    ConnectorKeyProto.KeyType.CLICKHOUSE_USER: 'User',
    ConnectorKeyProto.KeyType.CLICKHOUSE_PASSWORD: 'Password',
    ConnectorKeyProto.KeyType.POSTGRES_HOST: 'Host',
    ConnectorKeyProto.KeyType.POSTGRES_USER: 'DB User',
    ConnectorKeyProto.KeyType.POSTGRES_PASSWORD: 'Password',
    ConnectorKeyProto.KeyType.PAGER_DUTY_API_KEY: 'API Key',
    ConnectorKeyProto.KeyType.OPS_GENIE_API_KEY: 'API Key',
    ConnectorKeyProto.KeyType.EKS_ROLE_ARN: 'EKS Role ARN',
}


class Connector(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    connector_type = models.IntegerField(null=True, blank=True, choices=generate_choices(ConnectorType),
                                         default=ConnectorType.UNKNOWN)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(null=True, blank=True)
    metadata_md5 = models.CharField(max_length=256, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    created_by = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = [['account', 'name', 'connector_type', 'metadata_md5']]

    def __str__(self):
        return f'{self.account}:{self.connector_type}'

    def save(self, **kwargs):
        if self.metadata:
            self.metadata_md5 = md5(str(self.metadata).encode('utf-8')).hexdigest()
        super().save(**kwargs)

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
    key_type = models.IntegerField(null=True, blank=True,
                                   choices=generate_choices(ConnectorKeyProto.KeyType))
    key = models.TextField()
    metadata = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        unique_together = [['account', 'connector', 'key_type', 'key']]

    @property
    def get_proto(self):
        # Hard Coded Key Masking for sensitive keys
        if self.key_type in [ConnectorKeyProto.KeyType.DATADOG_APP_KEY, ConnectorKeyProto.KeyType.DATADOG_API_KEY,
                             ConnectorKeyProto.KeyType.NEWRELIC_API_KEY, ConnectorKeyProto.KeyType.NEWRELIC_APP_ID,
                             ConnectorKeyProto.KeyType.NEWRELIC_QUERY_KEY,
                             ConnectorKeyProto.KeyType.SLACK_BOT_AUTH_TOKEN,
                             ConnectorKeyProto.KeyType.HONEYBADGER_USERNAME,
                             ConnectorKeyProto.KeyType.HONEYBADGER_PASSWORD,
                             ConnectorKeyProto.KeyType.HONEYBADGER_PROJECT_ID, ConnectorKeyProto.KeyType.AWS_ACCESS_KEY,
                             ConnectorKeyProto.KeyType.AWS_SECRET_KEY, ConnectorKeyProto.KeyType.DATADOG_AUTH_TOKEN,
                             ConnectorKeyProto.KeyType.GOOGLE_CHAT_BOT_OAUTH_TOKEN,
                             ConnectorKeyProto.KeyType.GRAFANA_API_KEY,
                             ConnectorKeyProto.KeyType.AGENT_PROXY_API_KEY,
                             ConnectorKeyProto.KeyType.GITHUB_ACTIONS_TOKEN,
                             ConnectorKeyProto.KeyType.AGENT_PROXY_HOST,
                             ConnectorKeyProto.KeyType.CLICKHOUSE_USER, ConnectorKeyProto.KeyType.CLICKHOUSE_PASSWORD,
                             ConnectorKeyProto.KeyType.GCM_PROJECT_ID, ConnectorKeyProto.KeyType.GCM_PRIVATE_KEY,
                             ConnectorKeyProto.KeyType.GCM_CLIENT_EMAIL, ConnectorKeyProto.KeyType.PAGER_DUTY_API_KEY,
                             ConnectorKeyProto.KeyType.OPS_GENIE_API_KEY]:
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
