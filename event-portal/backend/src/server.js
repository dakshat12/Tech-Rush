require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const checkinRoutes = require('./routes/checkin.routes');
const volunteerRoutes = require('./routes/volunteer.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.set('io', io);

app.use(cors());
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again later.' },
});

app.get('/', (req, res) => {
  res.json({ message: 'Event Portal API is running' });
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/volunteers', volunteerRoutes);

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('join_event_room', (eventId) => {
    socket.join(`event_${eventId}`);
    console.log(`Socket ${socket.id} joined event_${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});