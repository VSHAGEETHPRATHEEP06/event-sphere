const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'event-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/events', eventRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Event Service: Database connected');

    await sequelize.sync();
    console.log('✅ Event Service: Models synced');

    app.listen(PORT, () => {
      console.log(`🚀 Event Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Event Service failed to start:', error);
    process.exit(1);
  }
};

start();
