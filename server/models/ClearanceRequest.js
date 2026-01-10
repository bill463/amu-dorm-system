const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClearanceRequest = sequelize.define('ClearanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  reason: {
    type: DataTypes.TEXT, // Changed to TEXT for potentially longer descriptions
    allowNull: true
  },
  adminComment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = ClearanceRequest;
