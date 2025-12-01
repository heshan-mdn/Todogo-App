#!/bin/bash

# Database connection string
DB_DSN="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSLMODE}"

# Run migrations up
migrate -path migrations -database "${DB_DSN}" up
