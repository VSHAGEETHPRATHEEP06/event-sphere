const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
  updateSeats,
  restoreSeats,
} = require('../controllers/eventController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllEvents);
router.get('/categories', getCategories);
router.get('/:id', getEventById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, createEvent);
router.put('/:id', authenticate, authorizeAdmin, updateEvent);
router.delete('/:id', authenticate, authorizeAdmin, deleteEvent);

// Internal routes (called by booking service)
router.post('/internal/update-seats', updateSeats);
router.post('/internal/restore-seats', restoreSeats);

module.exports = router;
