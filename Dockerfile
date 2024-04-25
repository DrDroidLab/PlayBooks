FROM python:3.9.16-bullseye

RUN apt-get update \
  # dependencies for building Python packages \
  && apt-get install -y build-essential \
  # psycopg2 dependencies
  && apt-get install -y libpq-dev \
  # Translations dependencies
  && apt-get install -y gettext \
  # Nginx
  && apt-get install nginx vim procps curl libpq-dev -y --no-install-recommends \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

COPY nginx.default /etc/nginx/sites-available/default
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /code

# Copy project
COPY .. .
RUN chown -R www-data:www-data /code

# Install dependenciess
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY scripts/setup_db.sh .
RUN sed -i 's/\r$//g' setup_db.sh
RUN chmod +x setup_db.sh

COPY scripts/start-server.sh .
RUN sed -i 's/\r$//g' start-server.sh
RUN chmod +x start-server.sh

COPY scripts/start-celery-worker.sh .
RUN sed -i 's/\r$//g' start-celery-worker.sh
RUN chmod +x start-celery-worker.sh

COPY scripts/start-celery-beat.sh .
RUN sed -i 's/\r$//g' start-celery-beat.sh
RUN chmod +x start-celery-beat.sh


EXPOSE 8080
STOPSIGNAL SIGTERM