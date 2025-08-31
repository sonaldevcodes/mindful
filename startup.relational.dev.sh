#!/usr/bin/env bash
set -e

#/opt/wait-for-it.sh postgres:5432

# Wait for PostgreSQL to be ready
/opt/wait-for-it.sh postgres:5432 --timeout=30 -- echo "PostgreSQL is ready"

# Check if database exists (optional)
# You might need to install psql client in your container for this

npm run migration:generate
npm run migration:run
#npm run seed:run:relational
npm run start:prod
