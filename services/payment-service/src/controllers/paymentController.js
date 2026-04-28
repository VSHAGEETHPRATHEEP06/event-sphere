const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');

// Validation schema
const paymentSchema = Joi.object({
  booking_id: Joi.number().integer().positive().required(),
  booking_ref: Joi.string().required(),
  amount: Joi.number().positive().required(),
  event_title: Joi.string().optional(),
  event_venue: Joi.string().optional(),
  event_date: Joi.string().optional(),
  seats: Joi.array().items(Joi.string()).optional(),
  payment_method: Joi.string().valid('card', 'bank_transfer', 'mobile_pay').default('card'),
  card_number: Joi.string().pattern(/^\d{16}$/).when('payment_method', {
    is: 'card',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  card_expiry: Joi.string().pattern(/^\d{2}\/\d{2}$/).when('payment_method', {
    is: 'card',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  card_cvv: Joi.string().pattern(/^\d{3,4}$/).when('payment_method', {
    is: 'card',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

/**
 * Process payment (simulated)
 */
const processPayment = async (req, res) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { booking_id, booking_ref, amount, payment_method, card_number,
            event_title, event_venue, event_date, seats } = value;
    const user_email = req.user.email;
    const user_name = req.user.name;

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ where: { booking_id } });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ error: 'Payment already completed for this booking.' });
    }

    // Simulate payment processing (90% success rate)
    const isSuccess = Math.random() > 0.1;
    const transactionId = `TXN-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    const cardLastFour = card_number ? card_number.slice(-4) : null;

    const payment = await Payment.create({
      booking_id,
      booking_ref,
      amount,
      status: isSuccess ? 'completed' : 'failed',
      payment_method,
      transaction_id: transactionId,
      card_last_four: cardLastFour,
    });

    // Publish payment result to RabbitMQ
    const { publishMessage, QUEUES } = require('../config/rabbitmq');

    if (isSuccess) {
      await publishMessage(QUEUES.PAYMENT_COMPLETED, {
        payment_id: payment.id,
        booking_id,
        booking_ref,
        transaction_id: transactionId,
        amount,
        status: 'completed',
        user_email,
        user_name,
        event_title,
        event_venue,
        event_date,
        seats,
      });
    } else {
      await publishMessage(QUEUES.PAYMENT_FAILED, {
        payment_id: payment.id,
        booking_id,
        booking_ref,
        transaction_id: transactionId,
        amount,
        status: 'failed',
        reason: 'Payment declined by bank.',
      });
    }

    res.status(isSuccess ? 200 : 402).json({
      message: isSuccess ? 'Payment successful.' : 'Payment failed.',
      payment: {
        id: payment.id,
        booking_id,
        booking_ref,
        amount,
        status: payment.status,
        transaction_id: transactionId,
        payment_method,
        card_last_four: cardLastFour,
      },
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get payment status by booking ID
 */
const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { booking_id: req.params.bookingId },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { processPayment, getPaymentByBooking };
