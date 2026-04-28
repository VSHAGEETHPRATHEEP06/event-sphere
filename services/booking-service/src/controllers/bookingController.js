const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { Booking, BookedSeat } = require('../models/Booking');
const redis = require('../config/redis');
const { publishMessage, QUEUES } = require('../config/rabbitmq');

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://event-service:3002';
const SEAT_LOCK_TTL = 300; // 5 minutes

// Validation schema
const bookingSchema = Joi.object({
  event_id: Joi.number().integer().positive().required(),
  seats: Joi.array().items(Joi.string().max(10)).min(1).max(10).required(),
});

/**
 * Create a new booking with Redis seat locking
 */
const createBooking = async (req, res) => {
  try {
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { event_id, seats } = value;
    const user = req.user;

    // 1. Fetch event details from Event Service (Synchronous REST call)
    let event;
    try {
      const response = await axios.get(`${EVENT_SERVICE_URL}/api/events/${event_id}`);
      event = response.data.event;
    } catch (err) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ error: 'Event is not available for booking.' });
    }

    if (event.available_seats < seats.length) {
      return res.status(400).json({ error: 'Not enough seats available.' });
    }

    // 2. Try to lock seats using Redis SETNX (distributed locking)
    const lockedSeats = [];
    const lockKeys = [];

    for (const seat of seats) {
      const lockKey = `seat_lock:${event_id}:${seat}`;
      const locked = await redis.set(lockKey, user.id, 'EX', SEAT_LOCK_TTL, 'NX');

      if (!locked) {
        // Seat already locked — release previously locked seats
        for (const key of lockKeys) {
          await redis.del(key);
        }
        return res.status(409).json({
          error: `Seat ${seat} is already being booked by another user. Please try different seats.`,
        });
      }

      lockedSeats.push(seat);
      lockKeys.push(lockKey);
    }

    // 3. Create booking in database
    const bookingRef = `ES-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    const totalAmount = parseFloat(event.price) * seats.length;

    const booking = await Booking.create({
      booking_ref: bookingRef,
      user_id: user.id,
      user_email: user.email,
      user_name: user.name,
      event_id: event.id,
      event_title: event.title,
      event_venue: event.venue,
      event_date: event.event_date,
      event_time: event.event_time,
      num_seats: seats.length,
      total_amount: totalAmount,
      status: 'pending',
    });

    // Create booked seats
    const seatRecords = seats.map(seat => ({
      booking_id: booking.id,
      seat_number: seat,
    }));
    await BookedSeat.bulkCreate(seatRecords);

    // 4. Update available seats in Event Service
    try {
      await axios.post(`${EVENT_SERVICE_URL}/api/events/internal/update-seats`, {
        eventId: event_id,
        seatsToBook: seats.length,
      });
    } catch (err) {
      console.error('Failed to update event seats:', err.message);
    }

    // 5. Publish booking.created event to RabbitMQ (Asynchronous)
    await publishMessage(QUEUES.BOOKING_CREATED, {
      booking_id: booking.id,
      booking_ref: bookingRef,
      user_id: user.id,
      user_email: user.email,
      user_name: user.name,
      event_id: event.id,
      event_title: event.title,
      event_venue: event.venue,
      event_date: event.event_date,
      event_time: event.event_time,
      seats: seats,
      total_amount: totalAmount,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Booking created successfully. Payment processing...',
      booking: {
        id: booking.id,
        booking_ref: bookingRef,
        event_title: event.title,
        event_venue: event.venue,
        event_date: event.event_date,
        event_time: event.event_time,
        seats: seats,
        num_seats: seats.length,
        total_amount: totalAmount,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get all bookings for the authenticated user
 */
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [{ model: BookedSeat, as: 'seats', attributes: ['seat_number'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: BookedSeat, as: 'seats', attributes: ['seat_number'] }],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Cancel a booking
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: BookedSeat, as: 'seats', attributes: ['seat_number'] }],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled.' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Release seat locks from Redis
    for (const seat of booking.seats) {
      const lockKey = `seat_lock:${booking.event_id}:${seat.seat_number}`;
      await redis.del(lockKey);
    }

    // Restore seats in Event Service
    try {
      await axios.post(`${EVENT_SERVICE_URL}/api/events/internal/restore-seats`, {
        eventId: booking.event_id,
        seatsToRestore: booking.num_seats,
      });
    } catch (err) {
      console.error('Failed to restore event seats:', err.message);
    }

    // Publish cancellation event
    await publishMessage(QUEUES.BOOKING_CANCELLED, {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      user_email: booking.user_email,
      user_name: booking.user_name,
      event_title: booking.event_title,
      event_venue: booking.event_venue,
      event_date: booking.event_date,
      seats: booking.seats.map(s => s.seat_number),
      total_amount: booking.total_amount,
    });

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get booked seats for an event (public)
 */
const getBookedSeats = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const bookedSeats = await BookedSeat.findAll({
      include: [{
        model: Booking,
        where: { event_id: eventId, status: { [require('sequelize').Op.ne]: 'cancelled' } },
        attributes: [],
      }],
      attributes: ['seat_number'],
    });

    const seats = bookedSeats.map(s => s.seat_number);

    res.json({ booked_seats: seats });
  } catch (error) {
    console.error('Get booked seats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getBookedSeats,
};
