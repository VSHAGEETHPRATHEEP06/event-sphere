const express = require('express');
const router = express.Router();
const { processPayment, getPaymentByBooking } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service', timestamp: new Date().toISOString() });
});

router.post('/', authenticate, processPayment);
router.get('/:bookingId', authenticate, getPaymentByBooking);

module.exports = router;
