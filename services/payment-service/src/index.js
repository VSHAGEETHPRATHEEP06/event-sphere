const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const paymentRoutes = require('./routes/paymentRoutes');
const { connectRabbitMQ, subscribeToQueue, QUEUES, publishMessage } = require('./config/rabbitmq');
const Payment = require('./models/Payment');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/payments', paymentRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

/**
 * Handle booking.created events - auto process (for demo purposes)
 * In production, this would wait for user to submit payment info via REST endpoint.
 * For demo, we auto-process pending payments after booking creation.
 */
const handleBookingCreated = async (message) => {
  try {
    console.log(`📋 Payment Service received booking: ${message.booking_ref}`);
    // Payment will be processed when user submits payment form via REST API
    // This handler just logs the booking for monitoring
  } catch (error) {
    console.error('Handle booking created error:', error);
  }
};

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Payment Service: Database connected');

    await sequelize.sync();
    console.log('✅ Payment Service: Models synced');

    await connectRabbitMQ();
    await subscribeToQueue(QUEUES.BOOKING_CREATED, handleBookingCreated);

    app.listen(PORT, () => {
      console.log(`🚀 Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Payment Service failed to start:', error);
    process.exit(1);
  }
};

start();
