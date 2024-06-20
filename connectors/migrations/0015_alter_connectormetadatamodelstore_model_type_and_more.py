# Generated by Django 4.1.13 on 2024-06-20 10:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_userinvitation'),
        ('connectors', '0014_alter_connector_connector_type_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='connectormetadatamodelstore',
            name='model_type',
            field=models.IntegerField(choices=[(0, 'UNKNOWN_MT'), (1, 'NEW_RELIC_POLICY'), (2, 'NEW_RELIC_CONDITION'), (3, 'NEW_RELIC_ENTITY'), (4, 'NEW_RELIC_ENTITY_DASHBOARD'), (5, 'NEW_RELIC_ENTITY_APPLICATION'), (6, 'NEW_RELIC_NRQL'), (101, 'DATADOG_MONITOR'), (102, 'DATADOG_DASHBOARD'), (103, 'DATADOG_LIVE_INTEGRATION_AWS'), (104, 'DATADOG_LIVE_INTEGRATION_AWS_LOG'), (105, 'DATADOG_LIVE_INTEGRATION_AZURE'), (106, 'DATADOG_LIVE_INTEGRATION_CLOUDFLARE'), (107, 'DATADOG_LIVE_INTEGRATION_FASTLY'), (108, 'DATADOG_LIVE_INTEGRATION_GCP'), (109, 'DATADOG_LIVE_INTEGRATION_CONFLUENT'), (110, 'DATADOG_SERVICE'), (111, 'DATADOG_METRIC'), (112, 'DATADOG_QUERY'), (201, 'CLOUDWATCH_METRIC'), (202, 'CLOUDWATCH_LOG_GROUP'), (301, 'GRAFANA_DATASOURCE'), (302, 'GRAFANA_DASHBOARD'), (303, 'GRAFANA_TARGET_METRIC_PROMQL'), (304, 'GRAFANA_PROMETHEUS_DATASOURCE'), (401, 'CLICKHOUSE_DATABASE'), (501, 'SLACK_CHANNEL'), (601, 'MARKDOWN'), (602, 'IFRAME'), (701, 'POSTGRES_QUERY'), (801, 'EKS_CLUSTER'), (901, 'SQL_DATABASE_CONNECTION_RAW_QUERY'), (1001, 'AZURE_WORKSPACE'), (1100, 'SSH_SERVER'), (1201, 'GRAFANA_MIMIR_PROMQL'), (1301, 'GKE_CLUSTER'), (1401, 'PAGERDUTY_INCIDENT')], db_index=True, default=0),
        ),
        migrations.CreateModel(
            name='PagerDutyConnectorDataReceived',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('incident_id', models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                ('title', models.TextField(blank=True, null=True)),
                ('service_id', models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                ('service_name', models.TextField(blank=True, null=True)),
                ('incident_created_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.account')),
                ('connector', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='connectors.connector')),
            ],
        ),
    ]
