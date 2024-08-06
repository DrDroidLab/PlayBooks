import logging
import os

import uuid
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from media.models import Image, CSVFile, TextFile
from PIL import Image as PILImage

from utils.time_utils import current_milli_time
from utils.uri_utils import build_absolute_uri

logger = logging.getLogger(__name__)


def generate_local_image_path(image_data=None, image_name: str = None):
    random_name = str(uuid.uuid4())
    if not image_name:
        image_name = f'{current_milli_time()}_{random_name}' + '.png'
    if not image_name.endswith('.png'):
        image_name += '.png'
    file_path = os.path.join(settings.MEDIA_IMAGE_LOCATION, image_name)
    if image_data:
        file_content = ContentFile(image_data)
        return default_storage.save(file_path, file_content)
    else:
        return file_path


def generate_local_csv_path(file_name: str = None):
    random_name = str(uuid.uuid4())
    if not file_name:
        file_name = f'{current_milli_time()}_{random_name}' + '.csv'
    if not file_name.endswith('.csv'):
        file_name += '.csv'
    return os.path.join(settings.MEDIA_CSV_FILE_LOCATION[1:], file_name)


def generate_local_text_file_path(file_name: str = None):
    random_name = str(uuid.uuid4())
    if not file_name:
        file_name = f'{current_milli_time()}_{random_name}' + '.md'
    if not file_name.endswith('.md'):
        file_name += '.md'
    return os.path.join(settings.MEDIA_TEXT_FILE_LOCATION[1:], file_name)


def save_image_to_db(image_file_path, image_title: str = 'Untitled', image_description: str = None,
                     image_metadata: dict = None, remove_file_from_os=False) -> str:
    try:
        image_instance = Image.objects.create(title=image_title, description=image_description, metadata=image_metadata)
        image = PILImage.open(image_file_path)
        image_instance.save_image_to_db(image)

        location = settings.MEDIA_IMAGE_LOCATION + '?uuid=' + str(image_instance.uuid)
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


def save_csv_to_db(csv_file_path, csv_title: str = 'Untitled', csv_description: str = None,
                   csv_metadata: dict = None, remove_file_from_os=False) -> (str, str):
    try:
        csv_file_instance = CSVFile.objects.create(title=csv_title, description=csv_description, metadata=csv_metadata)
        csv_file_instance.save_csv_as_blob(csv_file_path)

        location = settings.MEDIA_CSV_FILE_LOCATION + '?uuid=' + str(csv_file_instance.uuid)
        protocol = settings.MEDIA_STORAGE_SITE_HTTP_PROTOCOL
        enabled = settings.MEDIA_STORAGE_USE_SITE
        object_url = build_absolute_uri(None, location, protocol, enabled)

        if remove_file_from_os:
            try:
                os.remove(csv_file_path)
            except Exception as e:
                logger.warning(f'Error removing image file from OS: {e}')
        return csv_file_instance.uuid, object_url
    except Exception as e:
        logger.error(f'Error saving image to database: {e}')
        raise e


def save_text_to_db(text_file_path, text_title: str = 'Untitled', text_description: str = None,
                    text_metadata: dict = None, remove_file_from_os=False) -> (str, str):
    try:
        text_file_instance = TextFile.objects.create(title=text_title, description=text_description,
                                                     metadata=text_metadata)
        with open(text_file_path, 'r') as file:
            text_content = file.read()
        text_file_instance.save_text_as_blob(text_content)

        location = settings.MEDIA_TEXT_FILE_LOCATION + '?uuid=' + str(text_file_instance.uuid)
        protocol = settings.MEDIA_STORAGE_SITE_HTTP_PROTOCOL
        enabled = settings.MEDIA_STORAGE_USE_SITE
        object_url = build_absolute_uri(None, location, protocol, enabled)

        if remove_file_from_os:
            try:
                os.remove(text_file_path)
            except Exception as e:
                logger.warning(f'Error removing image file from OS: {e}')
        return text_file_instance.uuid, object_url
    except Exception as e:
        logger.error(f'Error saving image to database: {e}')
        raise e
