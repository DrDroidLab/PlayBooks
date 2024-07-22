#!/bin/sh
set -e

# Substitute environment variables in env.template.ts
envsubst < /usr/share/nginx/html/env.template.ts > /usr/share/nginx/html/env.js

# Start nginx
exec nginx -g "daemon off;"