const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

// Connect to database (with automatic in-memory fallback)
connectDB();

let PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
    console.log(`[API Base] http://localhost:${port}/api`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Port ${port} is currently in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[Server Error]:', err);
    }
  });
};

startServer(PORT);

process.on('unhandledRejection', (err) => {
  console.error(`[UnhandledRejection Error]: ${err.message}`);
});
