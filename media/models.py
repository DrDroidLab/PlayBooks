import io

import uuid as uuid

import pandas as pd
from django.db import models
from PIL import Image as PILImage


class Image(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField(null=True, blank=True, default='Untitled')
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)

    image_data = models.BinaryField()

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.uuid})"

    def save_image_to_db(self, image):
        img_io = io.BytesIO()
        image.save(img_io, format='PNG')
        self.image_data = img_io.getvalue()
        self.save()

    def get_image_from_db(self):
        return PILImage.open(io.BytesIO(self.image_data))


class CSVFile(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    title = models.TextField(null=True, blank=True, default='Untitled')
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)

    csv_blob = models.BinaryField()

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.uuid})"

    def save_df_as_blob(self, df):
        """
        Converts the given DataFrame to a binary blob and saves it in the database.
        """
        self.csv_blob = df.to_csv(index=False).encode('utf-8')
        self.save()

    def save_csv_as_blob(self, csv_path):
        """
        Converts the CSV at the given path to a binary blob and saves it in the database.
        """
        df = pd.read_csv(csv_path)
        self.save_df_as_blob(df)

    def fetch_df_from_blob(self):
        """
        Fetches the CSV blob from the database using the provided UUID and returns it as a DataFrame.
        """
        csv_memory_view = self.csv_blob
        csv_binary = bytes(csv_memory_view)
        csv_text = csv_binary.decode('utf-8')
        return pd.read_csv(io.StringIO(csv_text))

    def fetch_csv_from_blob(self, write=False, output_path=None):
        """
        Fetches the CSV blob from the database using the provided UUID and writes it to a CSV file at the output path.
        """
        csv_memory_view = self.csv_blob
        csv_binary = bytes(csv_memory_view)
        csv_text = csv_binary.decode('utf-8')
        if write:
            if output_path is None:
                output_path = f"{self.title}-{str(self.uuid)}.csv"
            with open(output_path, 'w') as output_file:
                output_file.write(csv_text)
        return csv_text


class TextFile(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    title = models.TextField(null=True, blank=True, default='Untitled')
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)

    text_blob = models.BinaryField()

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.uuid})"

    def save_text_as_blob(self, text):
        """
        Converts the given text to a binary blob and saves it in the database.
        """
        self.text_blob = text.encode('utf-8')
        self.save()

    def fetch_text_from_blob(self, write=False, output_path=None):
        """
        Fetches the text blob from the database using the provided UUID and writes it to a text file at the output path.
        """
        text_memory_view = self.text_blob
        text_binary = bytes(text_memory_view)
        if write:
            if output_path is None:
                output_path = f"{self.title}-{str(self.uuid)}.md"
            with open(output_path, 'w') as output_file:
                output_file.write(text_binary.decode('utf-8'))
        return text_binary.decode('utf-8')
