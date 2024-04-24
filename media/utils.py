import logging
import os

from django.conf import settings

from media.models import Image
from PIL import Image as PILImage

from utils.uri_utils import build_absolute_uri

logger = logging.getLogger(__name__)


def save_image_to_db(image_file_path, image_title: str = 'Untitled', image_description: str = None,
                     image_metadata: dict = None, remove_file_from_os=False) -> str:
    try:
        image_instance = Image.objects.create(title=image_title, description=image_description, metadata=image_metadata)
        image = PILImage.open(image_file_path)
        image_instance.save_image_to_db(image)
        location = settings.MEDIA_STORAGE_LOCATION + '?uuid=' + str(image_instance.uuid)
        protocol = settings.MEDIA_STORAGE_SITE_HTTP_PROTOCOL
        enabled = settings.MEDIA_STORAGE_USE_SITE
        object_url = build_absolute_uri(None, location, protocol, enabled)
        if remove_file_from_os:
            try:
                os.remove(image_file_path)
            except Exception as e:
                logger.warning(f'Error removing image file from OS: {e}')
        return object_url
    except Exception as e:
        logger.error(f'Error saving image to database: {e}')
        raise e
