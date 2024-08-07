# Generated by Django 4.1.13 on 2024-08-06 09:37

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('media', '0004_csvfile_image_created_by'),
    ]

    operations = [
        migrations.CreateModel(
            name='TextFile',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('title', models.TextField(blank=True, default='Untitled', null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('metadata', models.JSONField(blank=True, null=True)),
                ('text_blob', models.BinaryField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.TextField(blank=True, null=True)),
            ],
        ),
    ]
