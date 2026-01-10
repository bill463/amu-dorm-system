const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');
const MaintenanceRequest = require('./MaintenanceRequest');
const ClearanceRequest = require('./ClearanceRequest');
const LostItem = require('./LostItem');
const DormChangeRequest = require('./DormChangeRequest');
const Message = require('./Message');

// Associations
User.belongsTo(Room, { foreignKey: 'roomId' });
Room.hasMany(User, { foreignKey: 'roomId', as: 'occupants' });

MaintenanceRequest.belongsTo(User, { foreignKey: 'studentId' });
User.hasMany(MaintenanceRequest, { foreignKey: 'studentId' });

ClearanceRequest.belongsTo(User, { foreignKey: 'studentId' });
User.hasMany(ClearanceRequest, { foreignKey: 'studentId' });

LostItem.belongsTo(User, { foreignKey: 'studentId' });
User.hasMany(LostItem, { foreignKey: 'studentId' });

DormChangeRequest.belongsTo(User, { foreignKey: 'studentId' });
User.hasMany(DormChangeRequest, { foreignKey: 'studentId' });
DormChangeRequest.belongsTo(Room, { foreignKey: 'currentRoomId' });
// Optionally associate with preferred room if needed, but keeping it simple for now

// Message Associations
Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });
User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });

module.exports = {
  sequelize,
  User,
  Room,
  MaintenanceRequest,
  ClearanceRequest,
  LostItem,
  DormChangeRequest,
  Message
};
