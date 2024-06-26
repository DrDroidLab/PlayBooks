# Generated by Django 4.1.13 on 2024-06-25 07:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workflows', '0010_alter_workflowaction_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workflowaction',
            name='type',
            field=models.IntegerField(choices=[(0, 'UNKNOWN'), (1, 'API'), (2, 'SLACK_MESSAGE'), (3, 'SLACK_THREAD_REPLY'), (4, 'MS_TEAMS_MESSAGE_WEBHOOK'), (5, 'PAGERDUTY_NOTES')], db_index=True),
        ),
        migrations.AlterField(
            model_name='workflowentrypoint',
            name='type',
            field=models.IntegerField(choices=[(0, 'UNKNOWN'), (1, 'API'), (2, 'SLACK_CHANNEL_ALERT'), (3, 'PAGERDUTY_INCIDENT')], db_index=True),
        ),
    ]
