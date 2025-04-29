#!/bin/bash

# Source database configuration variables from the test helper
DB_HOST="localhost"
DB_PORT=5432
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="usersdb_test"

# Create the test database if it doesn't exist
echo "Creating test database if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -c "CREATE DATABASE $DB_NAME"

# Drop all connections to the test database
echo "Dropping existing connections to the test database..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Set test environment variables
export DATABASE_HOST=$DB_HOST
export DATABASE_PORT=$DB_PORT
export DATABASE_USER=$DB_USER
export DATABASE_PASSWORD=$DB_PASSWORD
export DATABASE_NAME=$DB_NAME
export DATABASE_SYNC=true

# Run the tests
echo "Running integration tests..."
NODE_ENV=test jest --config ./test/jest-e2e.json

# Exit with the status of the test command
exit $? 