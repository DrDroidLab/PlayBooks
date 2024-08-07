# Generated by Django 4.1.13 on 2024-07-12 07:38
from hashlib import md5

from django.db import migrations


def add_ck_key_md5(apps, schema_editor):
    ConnectorKey = apps.get_model("connectors", "ConnectorKey")

    for ck in ConnectorKey.objects.all():
        try:
            key = ck.key
            key_md5 = md5(str(key).encode('utf-8')).hexdigest()
            ck.key_md5 = key_md5
            ck.save()
        except Exception as e:
            print(f"Failed to add key md5 for connector key {ck.id} with error: {str(e)}")


class Migration(migrations.Migration):
    dependencies = [
        ('connectors', '0022_alter_connectorkey_unique_together_and_more'),
    ]

    operations = [
        migrations.RunPython(add_ck_key_md5, migrations.RunPython.noop)
    ]
