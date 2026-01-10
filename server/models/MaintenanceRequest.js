const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Rejected'),
    defaultValue: 'Pending'
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = MaintenanceRequest;
