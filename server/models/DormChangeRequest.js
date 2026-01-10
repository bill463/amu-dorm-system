const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DormChangeRequest = sequelize.define('DormChangeRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  preferredDorm: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  adminComment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = DormChangeRequest;
