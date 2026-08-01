require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Event Portal API is running' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Binding to 0.0.0.0 (not just localhost) so other devices on your network can reach it later
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});