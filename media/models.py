import io

import uuid as uuid
from django.db import models
from PIL import Image as PILImage


class Image(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField(null=True, blank=True, default='Untitled')
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)

    image_data = models.BinaryField()

    created_at = models.DateTimeField(auto_now_add=True)

    def save_image_to_db(self, image):
        img_io = io.BytesIO()
        image.save(img_io, format='PNG')
        self.image_data = img_io.getvalue()
        self.save()

    def get_image_from_db(self):
        return PILImage.open(io.BytesIO(self.image_data))

    def __str__(self):
        return self.title
