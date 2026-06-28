require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/socket/socketManager');
const { startMorningBriefJob } = require('./src/jobs/morningBrief');
const fs = require('fs');
const path = require('path');

try {
  console.log("🔍 Models directory contents:", fs.readdirSync(path.join(__dirname, 'src', 'models')));
} catch (err) {
  console.log("❌ Could not read models directory:", err.message);
}
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

initSocket(server);
startMorningBriefJob();

const startMainServer = () => {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      http.get({ hostname: '127.0.0.1', port: PORT, path: '/health' }, (res) => {
        console.log(`⚠️ Port ${PORT} is already in use. An existing backend is responding, so this duplicate start was skipped.`);
        process.exit(0);
      }).on('error', () => {
        console.error(`❌ Port ${PORT} is already in use by another process. Stop it or change PORT in Backend/.env.`);
        process.exit(1);
      });
      return;
    }

    console.error('❌ Server failed to start:', err);
    process.exit(1);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LifeSaver AI Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Development convenience: listen on legacy port 5000 and redirect to actual PORT
if (process.env.NODE_ENV !== 'production') {
  const devProxyPort = 5000;
  const proxy = http.createServer((req, res) => {
    const target = `http://localhost:${PORT}${req.url}`;
    res.writeHead(302, { Location: target });
    res.end();
  });

  proxy.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${devProxyPort} is already in use; skipping dev proxy.`);
      return;
    }
    console.error('❌ Dev proxy failed to start:', err);
  });

  proxy.listen(devProxyPort, '0.0.0.0', () => {
    console.log(`🔁 Dev proxy listening on port ${devProxyPort} and redirecting to ${PORT}`);
  });
}

startMainServer();

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shut down gracefully');
    process.exit(0);
  });
});