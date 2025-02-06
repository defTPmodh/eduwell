# Generate Prisma Client
Write-Host "Generating Prisma Client..."
npx prisma generate

# Push the schema to the database
Write-Host "Pushing schema to database..."
npx prisma db push

# Run the initialization script
Write-Host "Running initialization script..."
npx ts-node -P tsconfig.json scripts/init-db.ts 