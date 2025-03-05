# Generated by Django 4.1.13 on 2025-03-05 11:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import encrypted_model_fields.fields
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0003_accountuseroauth2sessioncodestore'),
        ('executor', '0045_upgrade_step_relation_conditions'),
    ]

    operations = [
        migrations.CreateModel(
            name='Secret',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('key', models.CharField(help_text='Reference key for the secret', max_length=255)),
                ('value', encrypted_model_fields.fields.EncryptedTextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('description', models.TextField(blank=True)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.account')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_secrets', to=settings.AUTH_USER_MODEL)),
                ('last_updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_secrets', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(
            model_name='secret',
            index=models.Index(fields=['key', 'account', 'is_active'], name='executor_se_key_60cc82_idx'),
        ),
        migrations.AddConstraint(
            model_name='secret',
            constraint=models.UniqueConstraint(condition=models.Q(('is_active', True)), fields=('key', 'account', 'is_active'), name='unique_active_key_per_account'),
        ),
    ]
