#!/usr/bin/env bash
set -x
set -o errexit
set -o nounset

QUEUE="${CELERY_QUEUE:-celery}"
WORKER_COUNT="${CELERY_WORKER_COUNT:-10}"

WORKER_MAX_TASKS_PER_CHILD="${CELERY_WORKER_MAX_TASKS_PER_CHILD:-1000}"
WORKER_PREFETCH_MULTIPLIER="${CELERY_WORKER_PREFETCH_MULTIPLIER:-1}"

celery -A playbooks worker --concurrency=$WORKER_COUNT -l INFO -Ofair -Q $QUEUE --max-tasks-per-child=$WORKER_MAX_TASKS_PER_CHILD --prefetch-multiplier=$WORKER_PREFETCH_MULTIPLIER