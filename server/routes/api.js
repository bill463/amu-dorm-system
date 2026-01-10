const express = require('express');
const router = express.Router();
const { User, Room, MaintenanceRequest, ClearanceRequest, LostItem, DormChangeRequest, Message } = require('../models');

// === ROOMS ===
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [{ model: User, as: 'occupants', attributes: ['id', 'name'] }] // Include occupants
    });
    // Tranform to match frontend expectation if needed, or update frontend to use this structure
    // Frontend expects 'occupants' as array of IDs. 
    // We'll send full objects, frontend might be happier with that or we map it.
    // Let's map it to keep frontend changes minimal for now, or just send enriched data.
    // Actually, sending enriched data is better. We'll update frontend accordingly.
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rooms/assign', async (req, res) => {
  try {
    const { studentId, roomId } = req.body;
    const room = await Room.findByPk(roomId, { include: User });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Check capacity
    const currentOccupants = await User.count({ where: { roomId } });
    if (currentOccupants >= room.capacity) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Update user
    const user = await User.findByPk(studentId);
    if (!user) return res.status(404).json({ error: 'Student not found' });

    user.roomId = roomId;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === STUDENTS ===
router.get('/students', async (req, res) => {
  try {
    const students = await User.findAll({ where: { role: 'student' } });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student (Admin only)
router.post('/students', async (req, res) => {
  try {
    const { id, name, department, password, roomId } = req.body;

    // Basic validation
    if (!id || !name || !department || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findByPk(id);
    if (existingUser) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    let userRoomId = null;

    // If a room is selected, validate it and check capacity
    if (roomId) {
      const room = await Room.findByPk(roomId, {
        include: [{ model: User, as: 'occupants' }]
      });

      if (!room) {
        return res.status(404).json({ error: 'Selected room not found' });
      }

      if (room.occupants && room.occupants.length >= room.capacity) {
        return res.status(400).json({ error: 'Selected room is already full' });
      }

      userRoomId = roomId;
    }

    const newUser = await User.create({
      id,
      name,
      department,
      password, // In production, hash this!
      role: 'student',
      roomId: userRoomId
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.patch('/profile', async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update(updates);
    const userData = user.toJSON();
    delete userData.password;
    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === REQUESTS ===
router.get('/requests', async (req, res) => {
  try {
    const { studentId } = req.query;
    const where = studentId ? { studentId } : {};
    const requests = await MaintenanceRequest.findAll({ where });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/requests', async (req, res) => {
  try {
    const { studentId, category, description } = req.body;
    const request = await MaintenanceRequest.create({
      studentId,
      category,
      description,
      status: 'Pending'
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const request = await MaintenanceRequest.findByPk(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = status;
    await request.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === CLEARANCE ===
router.post('/clearance', async (req, res) => {
  try {
    const { studentId, reason } = req.body;
    const request = await ClearanceRequest.create({
      studentId,
      reason,
      status: 'Pending'
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/clearance', async (req, res) => {
  try {
    const { studentId, role } = req.query; // role passed for simplicity, or check user token irl
    const where = {};
    if (studentId) where.studentId = studentId;

    const requests = await ClearanceRequest.findAll({
      where,
      include: [{ model: User, attributes: ['name', 'id', 'department'] }]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const request = await ClearanceRequest.findByPk(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (status) request.status = status;
    if (adminComment) request.adminComment = adminComment;

    await request.save();
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === LOST ITEMS ===
router.post('/lost-items', async (req, res) => {
  try {
    const { studentId, itemName, description, location, dateLost, image } = req.body;
    const item = await LostItem.create({
      studentId, itemName, description, location, dateLost, image, status: 'Lost'
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/lost-items', async (req, res) => {
  try {
    const items = await LostItem.findAll({
      include: [{ model: User, attributes: ['name', 'id'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/lost-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const item = await LostItem.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.status = status;
    await item.save();
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === DORM CHANGE ===
router.post('/dorm-change', async (req, res) => {
  try {
    const { studentId, currentRoomId, preferredDorm, reason } = req.body;
    const request = await DormChangeRequest.create({
      studentId, currentRoomId, preferredDorm, reason, status: 'Pending'
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dorm-change', async (req, res) => {
  try {
    const { studentId } = req.query;
    const where = studentId ? { studentId } : {};
    const requests = await DormChangeRequest.findAll({
      where,
      include: [
        { model: User, attributes: ['name', 'id'] },
        { model: Room, attributes: ['block', 'number'] }
      ]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/dorm-change/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const request = await DormChangeRequest.findByPk(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Logic for Approving
    if (status === 'Approved' && request.status !== 'Approved') {
      // Attempt to find the room
      // Assuming preferredDorm holds the Room Number e.g. "101"
      const targetRoom = await Room.findOne({ where: { number: request.preferredDorm } });

      if (!targetRoom) {
        return res.status(400).json({ error: `Preferred room '${request.preferredDorm}' not found.` });
      }

      // Check Capacity
      const occupantCount = await User.count({ where: { roomId: targetRoom.id } });
      if (occupantCount >= targetRoom.capacity) {
        return res.status(400).json({ error: `Preferred room '${request.preferredDorm}' is already full.` });
      }

      // Move the student
      const student = await User.findByPk(request.studentId);
      if (student) {
        student.roomId = targetRoom.id;
        await student.save();
      }
    }

    if (status) request.status = status;
    if (adminComment) request.adminComment = adminComment;

    await request.save();
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === MESSAGES ===
router.post('/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = await Message.create({ senderId, receiverId, content });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const { userId } = req.query;
    // Get messages where the user is receiver OR sender
    // For now, let's just fetch inbox (received messages) for simplicity, or both.
    // The user will mostly care about Received messages in their inbox.
    const messages = await Message.findAll({
      where: { receiverId: userId },
      include: [{ model: User, as: 'Sender', attributes: ['name', 'id', 'role'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    message.isRead = true;
    await message.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
