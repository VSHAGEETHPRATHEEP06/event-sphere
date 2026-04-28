const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const bookingRoutes = require('./routes/bookingRoutes');
const { connectRabbitMQ, subscribeToQueue, QUEUES } = require('./config/rabbitmq');
const { Booking } = require('./models/Booking');
const redis = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/bookings', bookingRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

/**
 * Handle payment completed events - update booking status
 */
const handlePaymentCompleted = async (message) => {
  try {
    const { booking_id, transaction_id } = message;

    const booking = await Booking.findByPk(booking_id);
    if (booking) {
      booking.status = 'confirmed';
      await booking.save();
      console.log(`✅ Booking ${booking.booking_ref} confirmed (txn: ${transaction_id})`);

      // Release seat locks (they're confirmed now)
      const { BookedSeat } = require('./models/Booking');
      const seats = await BookedSeat.findAll({ where: { booking_id } });
      for (const seat of seats) {
        const lockKey = `seat_lock:${booking.event_id}:${seat.seat_number}`;
        await redis.del(lockKey);
      }
    }
  } catch (error) {
    console.error('Handle payment completed error:', error);
  }
};

/**
 * Handle payment failed events - update booking status
 */
const handlePaymentFailed = async (message) => {
  try {
    const { booking_id } = message;

    const booking = await Booking.findByPk(booking_id);
    if (booking) {
      booking.status = 'failed';
      await booking.save();
      console.log(`❌ Booking ${booking.booking_ref} failed`);

      // Release seat locks
      const { BookedSeat } = require('./models/Booking');
      const seats = await BookedSeat.findAll({ where: { booking_id } });
      for (const seat of seats) {
        const lockKey = `seat_lock:${booking.event_id}:${seat.seat_number}`;
        await redis.del(lockKey);
      }
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
};

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Booking Service: Database connected');

    await sequelize.sync();
    console.log('✅ Booking Service: Models synced');

    // Connect to RabbitMQ and subscribe to payment events
    await connectRabbitMQ();
    await subscribeToQueue(QUEUES.PAYMENT_COMPLETED, handlePaymentCompleted);
    await subscribeToQueue(QUEUES.PAYMENT_FAILED, handlePaymentFailed);

    app.listen(PORT, () => {
      console.log(`🚀 Booking Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Booking Service failed to start:', error);
    process.exit(1);
  }
};

start();
