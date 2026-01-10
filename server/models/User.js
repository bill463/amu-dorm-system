const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'admin'),
    defaultValue: 'student'
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  roomId: { // Explicitly defining FK for clarity, though belongsTo adds it
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'Rooms',
      key: 'id'
    }
  }
});

module.exports = User;
