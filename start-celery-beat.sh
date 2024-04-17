#!/usr/bin/env bash

set -o errexit
set -o nounset

rm -f './celerybeat.pid'
celery -A playbooks beat -l INFO