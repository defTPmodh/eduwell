#!/bin/bash

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push the schema to the database
echo "Pushing schema to database..."
npx prisma db push

# Run the initialization script
echo "Running initialization script..."
node -r ts-node/register scripts/init-db.ts 