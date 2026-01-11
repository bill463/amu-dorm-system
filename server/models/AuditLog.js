const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING, // e.g., 'ALLOCATE_ROOM', 'UPDATE_PROFILE', 'APPROVE_CLEARANCE'
    allowNull: false
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  targetId: {
    type: DataTypes.STRING, // ID of the student/room affected
    allowNull: true
  }
});

module.exports = AuditLog;
