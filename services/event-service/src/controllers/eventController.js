const Joi = require('joi');
const { Op } = require('sequelize');
const { Event, Category } = require('../models/Event');

// Validation schema
const eventSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().allow(''),
  venue: Joi.string().min(3).max(255).required(),
  category_id: Joi.number().integer().positive().required(),
  event_date: Joi.date().iso().required(),
  event_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  total_seats: Joi.number().integer().positive().required(),
  price: Joi.number().min(0).required(),
  image_url: Joi.string().uri().allow(''),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled'),
});

/**
 * Get all events with optional search and filter
 */
const getAllEvents = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { venue: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category_id = category;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.ne]: 'cancelled' };
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['event_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      events,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Create a new event (admin only)
 */
const createEvent = async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    value.available_seats = value.total_seats;

    const event = await Event.create(value);

    res.status(201).json({
      message: 'Event created successfully.',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Update event (admin only)
 */
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const updateSchema = Joi.object({
      title: Joi.string().min(3).max(255),
      description: Joi.string().allow(''),
      venue: Joi.string().min(3).max(255),
      category_id: Joi.number().integer().positive(),
      event_date: Joi.date().iso(),
      event_time: Joi.string().pattern(/^\d{2}:\d{2}$/),
      total_seats: Joi.number().integer().positive(),
      available_seats: Joi.number().integer().min(0),
      price: Joi.number().min(0),
      image_url: Joi.string().uri().allow(''),
      status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled'),
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await event.update(value);

    res.json({
      message: 'Event updated successfully.',
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Delete event (admin only)
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await event.update({ status: 'cancelled' });

    res.json({ message: 'Event cancelled successfully.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get all categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Update available seats (internal - called by booking service)
 */
const updateSeats = async (req, res) => {
  try {
    const { eventId, seatsToBook } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (event.available_seats < seatsToBook) {
      return res.status(400).json({ error: 'Not enough seats available.' });
    }

    event.available_seats -= seatsToBook;
    await event.save();

    res.json({ message: 'Seats updated.', available_seats: event.available_seats });
  } catch (error) {
    console.error('Update seats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Restore seats (internal - called when booking cancelled)
 */
const restoreSeats = async (req, res) => {
  try {
    const { eventId, seatsToRestore } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    event.available_seats = Math.min(event.available_seats + seatsToRestore, event.total_seats);
    await event.save();

    res.json({ message: 'Seats restored.', available_seats: event.available_seats });
  } catch (error) {
    console.error('Restore seats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
  updateSeats,
  restoreSeats,
};
