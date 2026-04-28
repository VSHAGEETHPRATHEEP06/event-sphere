const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getBookedSeats,
} = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

// Health check (public)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking-service', timestamp: new Date().toISOString() });
});

// Public routes
router.get('/seats/:eventId', getBookedSeats);

// Protected routes
router.post('/', authenticate, createBooking);
router.get('/', authenticate, getUserBookings);
router.get('/:id', authenticate, getBookingById);
router.delete('/:id', authenticate, cancelBooking);

module.exports = router;
