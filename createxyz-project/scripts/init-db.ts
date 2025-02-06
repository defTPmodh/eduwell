const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test the connection
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Create initial data if needed
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
      },
    });

    console.log('Created test user:', user);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 