#!/usr/bin/env bash

set -o errexit
set -o nounset


WORKER_COUNT="${GUNICORN_WORKER_COUNT:-5}"
WORKER_MAX_REQUEST="${GUNICORN_WORKER_MAX_REQUEST:-100000}"
WORKER_MAX_REQUEST_JITTER="${GUNICORN_WORKER_MAX_REQUEST_JITTER:-10000}"
WORKER_TIMEOUT="${GUNICORN_WORKER_TIMEOUT:-120}"

python manage.py collectstatic --noinput
gunicorn playbooks.wsgi --bind 0.0.0.0:8000 --workers $WORKER_COUNT --timeout $WORKER_TIMEOUT --max-requests $WORKER_MAX_REQUEST --max-requests-jitter $WORKER_MAX_REQUEST_JITTER &
nginx -g "daemon off;"
