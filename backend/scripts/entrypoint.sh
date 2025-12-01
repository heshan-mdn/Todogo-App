#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Run migrations
echo "Running database migrations..."
migrate -path /app/migrations -database "${DB_DSN}" up

# Start the application
echo "Starting application..."
exec ./main
