const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/help', require('./routes/help'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/transport', require('./routes/transport'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'SmartSight API is running 🚀', timestamp: new Date() });
});

// Socket.io for real-time volunteer matching
const connectedVolunteers = new Map();
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 New socket connected: ${socket.id}`);

  socket.on('register-volunteer', (data) => {
    connectedVolunteers.set(socket.id, { ...data, socketId: socket.id });
    console.log(`👋 Volunteer registered: ${data.name}`);
    socket.emit('volunteer-registered', { success: true });
  });

  socket.on('register-user', (data) => {
    connectedUsers.set(socket.id, { ...data, socketId: socket.id });
    console.log(`👤 User registered: ${data.name}`);
  });

  socket.on('request-help', (data) => {
    console.log(`🆘 Help requested by: ${data.userName}`);
    // Broadcast to all available volunteers
    if (connectedVolunteers.size > 0) {
      connectedVolunteers.forEach((volunteer, sid) => {
        io.to(sid).emit('help-request', {
          userId: data.userId,
          userName: data.userName,
          userSocketId: socket.id,
          location: data.location,
          message: data.message,
          timestamp: new Date(),
        });
      });
      socket.emit('help-requested', {
        success: true,
        volunteersNotified: connectedVolunteers.size,
      });
    } else {
      socket.emit('no-volunteers', { message: 'No volunteers available right now. Please try again later.' });
    }
  });

  socket.on('accept-help', (data) => {
    console.log(`✅ Help accepted by volunteer for user: ${data.userSocketId}`);
    const volunteer = connectedVolunteers.get(socket.id);
    // Notify the user
    io.to(data.userSocketId).emit('help-accepted', {
      volunteerName: volunteer?.name || 'A volunteer',
      volunteerSocketId: socket.id,
      message: 'A volunteer has accepted your request and will assist you shortly.',
    });
    // Acknowledge volunteer
    socket.emit('help-acceptance-confirmed', { userSocketId: data.userSocketId });
  });

  socket.on('send-message', (data) => {
    io.to(data.toSocketId).emit('receive-message', {
      from: data.from,
      message: data.message,
      timestamp: new Date(),
    });
  });

  socket.on('end-session', (data) => {
    if (data.toSocketId) {
      io.to(data.toSocketId).emit('session-ended', { message: 'The session has been ended.' });
    }
  });

  socket.on('disconnect', () => {
    connectedVolunteers.delete(socket.id);
    connectedUsers.delete(socket.id);
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 SmartSight server running on port ${PORT}`);
});
