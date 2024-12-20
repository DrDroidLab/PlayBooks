#!/bin/bash

# Exit script on any error
set -e

# Step 1: Set environment variables (adjust as needed)
export DJANGO_DEBUG=True
export CELERY_BROKER_URL=redis://localhost:6379/0
export CELERY_RESULT_BACKEND=redis://localhost:6379/0
export REDIS_URL=redis://localhost:6379/0
export POSTGRES_DB=db
export POSTGRES_USER=user
export POSTGRES_PASSWORD=pass
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export FLUENTD_ADDRESS=localhost:24224
# export OKTA_DOMAIN=your-okta-domain
# export OKTA_CLIENT_ID=your-okta-client-id

# Step 2: Set up Python virtual environment

echo "Setting up Python virtual environment..."

# Create the virtual environment using python3 -m venv
if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "Virtual environment created successfully."
fi

# Activate the virtual environment
source venv/bin/activate

# Step 3: Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip  # Upgrade pip to avoid any issues with older versions
pip install -r requirements.txt

# Step 4: Install frontend dependencies
echo "Installing frontend dependencies..."
cd web
npm install

# Step 5: Start the services

# Start Django server
echo "Starting Django server..."
cd ..
python manage.py runserver 0.0.0.0:8080 &

# Start Celery workers
echo "Starting Celery workers..."
celery -A playbooks worker --concurrency=10 -l INFO -Ofair -Q celery --max-tasks-per-child=1000 --prefetch-multiplier=1 &

# Start Workflow Scheduler Celery Worker
echo "Starting Workflow Scheduler Celery Worker..."
celery -A playbooks worker --concurrency=10 -l INFO -Ofair -Q workflow_scheduler --max-tasks-per-child=1000 --prefetch-multiplier=1 &

# Start Workflow Executor Celery Worker
echo "Starting Workflow Executor Celery Worker..."
celery -A playbooks worker --concurrency=10 -l INFO -Ofair -Q workflow_executor --max-tasks-per-child=1000 --prefetch-multiplier=1 &

# Start Workflow Action Execution Celery Worker
echo "Starting Workflow Action Execution Celery Worker..."
celery -A playbooks worker --concurrency=10 -l INFO -Ofair -Q workflow_action_execution --max-tasks-per-child=1000 --prefetch-multiplier=1 &

# Start Celery Beat
echo "Starting Celery Beat..."
celery -A playbooks beat --loglevel=info &

# Start the Web frontend
echo "Starting the Web frontend..."
cd web
npm run build && npm run start &

# Step 6: Verify services are running
echo "All services started successfully. Monitoring logs..."

# Keep the script running so that the services remain active
tail -f /dev/null
