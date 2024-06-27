#!/bin/sh
set -e

# Substitute environment variables in env.template.js
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Start nginx
exec nginx -g "daemon off;"