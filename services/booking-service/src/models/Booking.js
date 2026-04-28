const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_ref: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  user_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  event_title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  event_venue: {
    type: DataTypes.STRING(255),
  },
  event_date: {
    type: DataTypes.DATEONLY,
  },
  event_time: {
    type: DataTypes.TIME,
  },
  num_seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'confirmed', 'cancelled', 'failed']],
    },
  },
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

const BookedSeat = sequelize.define('BookedSeat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seat_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
}, {
  tableName: 'booked_seats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// Associations
Booking.hasMany(BookedSeat, { foreignKey: 'booking_id', as: 'seats' });
BookedSeat.belongsTo(Booking, { foreignKey: 'booking_id' });

module.exports = { Booking, BookedSeat };
