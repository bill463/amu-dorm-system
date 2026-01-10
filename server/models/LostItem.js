const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LostItem = sequelize.define('LostItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Lost', 'Found', 'Claimed'),
    defaultValue: 'Lost'
  },
  dateLost: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING, // URL to image
    allowNull: true
  }
});

module.exports = LostItem;
