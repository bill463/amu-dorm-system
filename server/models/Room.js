const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.STRING, // e.g., "B1-101"
    primaryKey: true,
    allowNull: false
  },
  block: {
    type: DataTypes.STRING,
    allowNull: false
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 6
  }
});

module.exports = Room;
