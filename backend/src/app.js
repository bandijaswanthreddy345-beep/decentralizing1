const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');

const configurePassport = require('./config/passport');
const authRoutes = require('./routes/auth');
const recordingRoutes = require('./routes/recordings');
const livekitRoutes = require('./routes/livekit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigin = process.env.CLIENT_URL;
if (process.env.NODE_ENV !== 'test') {
  console.log("CLIENT_URL:", allowedOrigin);
}

configurePassport();

const corsOptions = {
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/livekit', livekitRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

app.use(errorHandler);

module.exports = app;