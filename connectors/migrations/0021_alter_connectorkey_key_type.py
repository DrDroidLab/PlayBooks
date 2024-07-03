# Generated by Django 4.1.13 on 2024-07-03 08:52

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("connectors", "0020_alter_connector_connector_type_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="connectorkey",
            name="key_type",
            field=models.IntegerField(
                blank=True,
                choices=[
                    (0, "UNKNOWN_SKT"),
                    (1, "SENTRY_API_KEY"),
                    (6, "SENTRY_ORG_SLUG"),
                    (2, "DATADOG_APP_KEY"),
                    (3, "DATADOG_API_KEY"),
                    (15, "DATADOG_AUTH_TOKEN"),
                    (18, "DATADOG_API_DOMAIN"),
                    (4, "NEWRELIC_API_KEY"),
                    (5, "NEWRELIC_APP_ID"),
                    (7, "NEWRELIC_QUERY_KEY"),
                    (19, "NEWRELIC_API_DOMAIN"),
                    (8, "SLACK_BOT_AUTH_TOKEN"),
                    (9, "SLACK_CHANNEL_ID"),
                    (46, "SLACK_APP_ID"),
                    (10, "HONEYBADGER_USERNAME"),
                    (11, "HONEYBADGER_PASSWORD"),
                    (12, "HONEYBADGER_PROJECT_ID"),
                    (13, "AWS_ACCESS_KEY"),
                    (14, "AWS_SECRET_KEY"),
                    (20, "AWS_REGION"),
                    (23, "AWS_ASSUMED_ROLE_ARN"),
                    (40, "EKS_ROLE_ARN"),
                    (16, "GOOGLE_CHAT_BOT_OAUTH_TOKEN"),
                    (17, "GOOGLE_CHAT_BOT_SPACES"),
                    (21, "GRAFANA_HOST"),
                    (22, "GRAFANA_API_KEY"),
                    (24, "CLICKHOUSE_INTERFACE"),
                    (25, "CLICKHOUSE_HOST"),
                    (26, "CLICKHOUSE_PORT"),
                    (27, "CLICKHOUSE_USER"),
                    (28, "CLICKHOUSE_PASSWORD"),
                    (29, "GCM_PROJECT_ID"),
                    (30, "GCM_PRIVATE_KEY"),
                    (31, "GCM_CLIENT_EMAIL"),
                    (32, "GCM_TOKEN_URI"),
                    (33, "POSTGRES_HOST"),
                    (34, "POSTGRES_USER"),
                    (35, "POSTGRES_PASSWORD"),
                    (36, "POSTGRES_PORT"),
                    (37, "POSTGRES_DATABASE"),
                    (38, "POSTGRES_OPTIONS"),
                    (39, "SQL_DATABASE_CONNECTION_STRING_URI"),
                    (41, "PAGER_DUTY_API_KEY"),
                    (63, "PAGER_DUTY_CONFIGURED_EMAIL"),
                    (42, "OPS_GENIE_API_KEY"),
                    (43, "AGENT_PROXY_HOST"),
                    (44, "AGENT_PROXY_API_KEY"),
                    (45, "GITHUB_ACTIONS_TOKEN"),
                    (47, "OPEN_AI_API_KEY"),
                    (49, "REMOTE_SERVER_PEM"),
                    (50, "REMOTE_SERVER_USER"),
                    (51, "REMOTE_SERVER_HOST"),
                    (52, "REMOTE_SERVER_PASSWORD"),
                    (53, "MIMIR_HOST"),
                    (54, "X_SCOPE_ORG_ID"),
                    (55, "SSL_VERIFY"),
                    (56, "AZURE_SUBSCRIPTION_ID"),
                    (57, "AZURE_TENANT_ID"),
                    (58, "AZURE_CLIENT_ID"),
                    (59, "AZURE_CLIENT_SECRET"),
                    (60, "GKE_PROJECT_ID"),
                    (61, "GKE_SERVICE_ACCOUNT_JSON"),
                    (62, "MS_TEAMS_CONNECTOR_WEBHOOK_URL"),
                    (64, "ELASTIC_SEARCH_PROTOCOL"),
                    (65, "ELASTIC_SEARCH_HOST"),
                    (66, "ELASTIC_SEARCH_PORT"),
                    (67, "ELASTIC_SEARCH_API_KEY_ID"),
                    (68, "ELASTIC_SEARCH_API_KEY"),
                    (69, "GRAFANA_LOKI_PROTOCOL"),
                    (70, "GRAFANA_LOKI_HOST"),
                    (71, "GRAFANA_LOKI_PORT"),
                ],
                default=0,
                null=True,
            ),
        ),
    ]