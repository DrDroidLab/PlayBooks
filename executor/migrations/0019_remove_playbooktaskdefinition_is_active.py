# Generated by Django 4.1.13 on 2024-05-11 09:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('executor', '0018_alter_playbooksteptaskdefinitionmapping_unique_together'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='playbooktaskdefinition',
            name='is_active',
        ),
    ]
