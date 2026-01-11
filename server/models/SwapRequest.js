const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SwapRequest = sequelize.define('SwapRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Approved', 'Cancelled'),
    defaultValue: 'Pending'
  },
  adminComment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = SwapRequest;
