# Generated by Django 4.1.4 on 2024-04-26 05:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('connectors', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='connectormetadatamodelstore',
            name='model_type',
            field=models.IntegerField(choices=[(0, 'UNKNOWN_MT'), (1, 'NEW_RELIC_POLICY'), (2, 'NEW_RELIC_CONDITION'), (3, 'NEW_RELIC_ENTITY'), (4, 'NEW_RELIC_ENTITY_DASHBOARD'), (5, 'NEW_RELIC_ENTITY_APPLICATION'), (6, 'NEW_RELIC_NRQL'), (101, 'DATADOG_MONITOR'), (102, 'DATADOG_DASHBOARD'), (103, 'DATADOG_LIVE_INTEGRATION_AWS'), (104, 'DATADOG_LIVE_INTEGRATION_AWS_LOG'), (105, 'DATADOG_LIVE_INTEGRATION_AZURE'), (106, 'DATADOG_LIVE_INTEGRATION_CLOUDFLARE'), (107, 'DATADOG_LIVE_INTEGRATION_FASTLY'), (108, 'DATADOG_LIVE_INTEGRATION_GCP'), (109, 'DATADOG_LIVE_INTEGRATION_CONFLUENT'), (110, 'DATADOG_SERVICE'), (111, 'DATADOG_METRIC'), (112, 'DATADOG_QUERY'), (201, 'CLOUDWATCH_METRIC'), (202, 'CLOUDWATCH_LOG_GROUP'), (301, 'GRAFANA_DATASOURCE'), (302, 'GRAFANA_DASHBOARD'), (303, 'GRAFANA_TARGET_METRIC_PROMQL'), (401, 'CLICKHOUSE_DATABASE'), (501, 'SLACK_CHANNEL'), (601, 'MARKDOWN'), (701, 'POSTGRES_DATABASE'), (801, 'EKS_CLUSTER')], db_index=True, default=0),
        ),
    ]
