const amqp = require('amqplib');

let channel = null;
let connection = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://eventsphere:rabbitmq_secret@localhost:5672';

// Exchange and queue names
const EXCHANGE = 'eventsphere_events';
const QUEUES = {
  BOOKING_CREATED: 'booking.created',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  BOOKING_CANCELLED: 'booking.cancelled',
};

/**
 * Connect to RabbitMQ and create channel
 */
const connectRabbitMQ = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();

      // Create topic exchange
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

      // Assert all queues
      for (const queue of Object.values(QUEUES)) {
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, EXCHANGE, queue);
      }

      console.log('✅ Booking Service: RabbitMQ connected');
      return channel;
    } catch (error) {
      console.error(`❌ RabbitMQ connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  throw new Error('Failed to connect to RabbitMQ after retries');
};

/**
 * Publish a message to a routing key
 */
const publishMessage = async (routingKey, message) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  channel.publish(
    EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );

  console.log(`📤 Published message to ${routingKey}:`, JSON.stringify(message).substring(0, 100));
};

/**
 * Subscribe to a queue
 */
const subscribeToQueue = async (queue, handler) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  await channel.consume(queue, async (msg) => {
    if (msg) {
      try {
        const content = JSON.parse(msg.content.toString());
        console.log(`📥 Received message from ${queue}:`, JSON.stringify(content).substring(0, 100));
        await handler(content);
        channel.ack(msg);
      } catch (error) {
        console.error(`Error processing message from ${queue}:`, error);
        channel.nack(msg, false, false);
      }
    }
  });

  console.log(`👂 Subscribed to queue: ${queue}`);
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  publishMessage,
  subscribeToQueue,
  getChannel,
  EXCHANGE,
  QUEUES,
};
