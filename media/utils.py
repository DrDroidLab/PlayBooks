import logging
import os

import uuid
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from media.models import Image
from PIL import Image as PILImage

from utils.time_utils import current_milli_time
from utils.uri_utils import build_absolute_uri

logger = logging.getLogger(__name__)


def generate_local_image_path(image_data=None, image_name: str = None):
    randon_name = str(uuid.uuid4())
    if not image_name:
        image_name = f'{current_milli_time()}_{randon_name}' + '.png'
    if not image_name.endswith('.png'):
        image_name += '.png'
    file_path = os.path.join('images', image_name)
    if image_data:
        file_content = ContentFile(image_data)
        return default_storage.save(os.path.join(settings.MEDIA_ASSETS_ROOT, file_path), file_content)
    else:
        return os.path.join(settings.MEDIA_ASSETS_ROOT, file_path)


def generate_local_csv_path(file_name: str = None):
    randon_name = str(uuid.uuid4())
    if not file_name:
        file_name = f'{current_milli_time()}_{randon_name}' + '.csv'
    if not file_name.endswith('.csv'):
        file_name += '.png'
    file_path = os.path.join('files', file_name)
    return os.path.join(settings.MEDIA_ASSETS_ROOT, file_path)


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
