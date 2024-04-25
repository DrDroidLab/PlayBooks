from rest_framework import serializers

from media.models import Image


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('uuid', 'title', 'description', 'metadata', 'image_data')
