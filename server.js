const dotenv = require('dotenv');
const app = require('./app');
const prisma = require('./prisma/prisma');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });



const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const shutdown = async (signal) => {
  console.log(`👋 ${signal} received. Closing Prisma connection...`);
  await prisma.$disconnect();
  server.close(() => {
    console.log('💥 Server shut down gracefully');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));  // Ctrl + C
process.on('SIGTERM', () => shutdown('SIGTERM')); // Kill command
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  shutdown('Unhandled Rejection');
});

