const amqp = require('amqplib');
const { initTransporter, handlePaymentCompleted, handleBookingCancelled } = require('./handlers/emailHandler');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://eventsphere:rabbitmq_secret@localhost:5672';
const EXCHANGE = 'eventsphere_events';
const QUEUES = {
  PAYMENT_COMPLETED: 'payment.completed',
  BOOKING_CANCELLED: 'booking.cancelled',
};

const start = async () => {
  try {
    // Initialize email transporter
    await initTransporter();
    console.log('✅ Notification Service: Email transporter ready');

    // Connect to RabbitMQ with retries
    let connection;
    for (let i = 0; i < 10; i++) {
      try {
        connection = await amqp.connect(RABBITMQ_URL);
        break;
      } catch (err) {
        console.error(`❌ RabbitMQ connection attempt ${i + 1} failed:`, err.message);
        if (i < 9) await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!connection) {
      throw new Error('Failed to connect to RabbitMQ');
    }

    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    // Subscribe to payment.completed
    await channel.assertQueue(QUEUES.PAYMENT_COMPLETED, { durable: true });
    await channel.bindQueue(QUEUES.PAYMENT_COMPLETED, EXCHANGE, QUEUES.PAYMENT_COMPLETED);
    channel.consume(QUEUES.PAYMENT_COMPLETED, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📥 Received payment.completed for booking: ${content.booking_ref}`);
          await handlePaymentCompleted(content);
          channel.ack(msg);
        } catch (error) {
          console.error('Error handling payment.completed:', error);
          channel.nack(msg, false, false);
        }
      }
    });

    // Subscribe to booking.cancelled
    await channel.assertQueue(QUEUES.BOOKING_CANCELLED, { durable: true });
    await channel.bindQueue(QUEUES.BOOKING_CANCELLED, EXCHANGE, QUEUES.BOOKING_CANCELLED);
    channel.consume(QUEUES.BOOKING_CANCELLED, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📥 Received booking.cancelled for booking: ${content.booking_ref}`);
          await handleBookingCancelled(content);
          channel.ack(msg);
        } catch (error) {
          console.error('Error handling booking.cancelled:', error);
          channel.nack(msg, false, false);
        }
      }
    });

    console.log('✅ Notification Service: RabbitMQ connected');
    console.log('👂 Listening for payment.completed and booking.cancelled events...');
    console.log('🚀 Notification Service is running');
  } catch (error) {
    console.error('❌ Notification Service failed to start:', error);
    process.exit(1);
  }
};

start();
