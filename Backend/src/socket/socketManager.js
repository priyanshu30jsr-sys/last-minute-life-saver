const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin:      process.env.CLIENT_URL,
      methods:     ['GET', 'POST'],
      credentials: true
    },
    pingTimeout:  60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Each user joins a room named by their userId
    socket.on('join:user', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

const getSocketIO = () => {
  if (!io) throw new Error('Socket.io has not been initialized. Call initSocket first.');
  return io;
};

module.exports = { initSocket, getSocketIO };