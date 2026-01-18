const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Room, MaintenanceRequest, ClearanceRequest, LostItem, DormChangeRequest, Message, AuditLog, SwapRequest } = require('../models');

const logAction = async (adminId, action, details, targetId = null) => {
  try {
    await AuditLog.create({ adminId, action, details, targetId });
  } catch (e) {
    console.error('Failed to log action:', e);
  }
};

// === ROOMS ===
router.post('/rooms/reset', async (req, res) => {
  try {
    // SECURITY: This should be ADMIN ONLY. Ideally use middleware.
    // For now, we trust the caller (Admin Dashboard Front-end) or add basic check
    // if (!req.user || req.user.role !== 'admin') ... (skipped for brevity, assuming internal use)

    await Room.destroy({ where: {}, truncate: false }); // truncate: true might fail with FKs, use simple destroy

    // Re-seed with new structure: 4 Blocks, 4 Floors, 20 Rooms
    const newRooms = [];
    for (let b = 1; b <= 4; b++) {
      for (let f = 1; f <= 4; f++) {
        for (let r = 1; r <= 20; r++) {
          // Room numbers start from 001. f=1 -> 001, f=2 -> 101, etc.
          const roomNum = `${f - 1}${r.toString().padStart(2, '0')}`;
          newRooms.push({
            id: `B${b}-${roomNum}`,
            block: `Block ${b}`,
            number: roomNum,
            capacity: 6
          });
        }
      }
    }

    await Room.bulkCreate(newRooms);

    // Also clear student assignments to avoid "ghost" rooms?
    // Better to set their roomId to null
    await User.update({ roomId: null }, { where: { role: 'student' } });

    res.json({ success: true, message: `Successfully reset rooms. Created ${newRooms.length} rooms (4 Blocks x 80 rooms). All students unassigned.` });
  } catch (error) {
    console.error('Room Reset Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [{ model: User, as: 'occupants', attributes: ['id', 'name', 'profilePicture', 'department', 'bio', 'email', 'phone'] }] // Include occupants with profile details
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

// Delete student (Admin only)
router.delete('/students/:id', async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    await student.destroy();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk Auto-allocate rooms to unallocated students
router.post('/students/auto-allocate', async (req, res) => {
  try {
    const { strategies = [] } = req.body; // e.g., ['department', 'year', 'alphabetical']

    // 1. Get all unallocated students
    const students = await User.findAll({
      where: { role: 'student', roomId: null }
    });

    if (students.length === 0) {
      return res.json({ message: 'No unallocated students found.', count: 0 });
    }

    // Extraction helpers
    const getYear = (id) => (id || '').split('/').pop();

    // 2. Hierarchical Sort based on strategies array
    let sortedStudents = [...students];
    sortedStudents.sort((a, b) => {
      for (const s of strategies) {
        let cmp = 0;
        if (s === 'department') {
          cmp = (a.department || '').localeCompare(b.department || '');
        } else if (s === 'year') {
          cmp = getYear(a.id).localeCompare(getYear(b.id));
        } else if (s === 'alphabetical') {
          cmp = a.name.localeCompare(b.name);
        }
        if (cmp !== 0) return cmp;
      }
      return 0;
    });

    const hasDeptStrategy = strategies.includes('department');

    // 3. Get all rooms with current occupancy
    const rooms = await Room.findAll({
      include: [{ model: User, as: 'occupants' }],
      order: [['block', 'ASC'], ['number', 'ASC']]
    });

    // 4. Create an array of available slots
    let availableSlots = [];
    for (const room of rooms) {
      const occupiedCount = (room.occupants || []).length;
      const remaining = room.capacity - occupiedCount;
      for (let i = 0; i < remaining; i++) {
        availableSlots.push(room.id);
      }
    }

    if (availableSlots.length === 0) {
      return res.status(400).json({ error: 'No available room capacity found.' });
    }

    // 5. Assign students to slots
    const updates = [];
    let allocationCount = 0;

    if (hasDeptStrategy) {
      // Group unallocated students by department (they are already sorted within dept if other strategies provided)
      const deptGroups = {};
      sortedStudents.forEach(s => {
        const dept = s.department || 'Unknown';
        if (!deptGroups[dept]) deptGroups[dept] = [];
        deptGroups[dept].push(s);
      });

      // Track room state locally during allocation
      const roomStates = rooms.map(r => ({
        id: r.id,
        capacity: r.capacity,
        occupants: [...(r.occupants || [])],
        get currentDept() {
          return this.occupants.length > 0 ? this.occupants[0].department : null;
        },
        get remaining() {
          return this.capacity - this.occupants.length;
        }
      }));

      // Allocate department by department
      for (const [deptName, studentsInDept] of Object.entries(deptGroups)) {
        let studentIdx = 0;

        // First pass: try to fill rooms that already have this department
        for (const rs of roomStates) {
          if (studentIdx >= studentsInDept.length) break;
          if (rs.currentDept === deptName && rs.remaining > 0) {
            const spacesToFill = Math.min(rs.remaining, studentsInDept.length - studentIdx);
            for (let i = 0; i < spacesToFill; i++) {
              updates.push(studentsInDept[studentIdx].update({ roomId: rs.id }));
              rs.occupants.push({ department: deptName }); // mock for state tracking
              studentIdx++;
              allocationCount++;
            }
          }
        }

        // Second pass: use empty rooms
        for (const rs of roomStates) {
          if (studentIdx >= studentsInDept.length) break;
          if (rs.occupants.length === 0) {
            const spacesToFill = Math.min(rs.capacity, studentsInDept.length - studentIdx);
            for (let i = 0; i < spacesToFill; i++) {
              updates.push(studentsInDept[studentIdx].update({ roomId: rs.id }));
              rs.occupants.push({ department: deptName }); // mock for state tracking
              studentIdx++;
              allocationCount++;
            }
          }
        }
      }
    } else {
      // SEQUENTIAL ALLOCATION (Alphabetical or Year only)
      allocationCount = Math.min(sortedStudents.length, availableSlots.length);
      for (let i = 0; i < allocationCount; i++) {
        updates.push(sortedStudents[i].update({ roomId: availableSlots[i] }));
      }
    }

    await Promise.all(updates);

    // LOG ACTION
    await logAction('ADMIN_DASHBOARD', 'AUTO_ALLOCATE', `Allocated ${allocationCount} students using strategy: ${strategies.join(' > ')}`);

    res.json({
      message: `Successfully allocated ${allocationCount} students using: ${strategies.join(' > ')}.`,
      count: allocationCount
    });

  } catch (error) {
    console.error('Auto-allocate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cloudinary Config
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'amu-dorm-profiles',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

const upload = multer({ storage: storage });

router.patch('/profile', upload.single('profilePicture'), async (req, res) => {
  try {
    const { id, ...updates } = req.body;

    // If file uploaded, use cloud URL
    if (req.file && req.file.path) {
      updates.profilePicture = req.file.path;
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update(updates);
    const userData = user.toJSON();
    delete userData.password;
    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Profile Update Error:', error);
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
router.post('/lost-items', upload.single('image'), async (req, res) => {
  try {
    const { studentId, itemName, description, location, dateLost, status } = req.body;

    let imageUrl = null;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    const item = await LostItem.create({
      studentId,
      itemName,
      description,
      location,
      dateLost,
      image: imageUrl,
      status: status || 'Lost'
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
      // Attempt to find the room by ID or by Number
      const targetRoom = await Room.findOne({
        where: {
          [Op.or]: [
            { id: request.preferredDorm },
            { number: request.preferredDorm },
            { id: `Block ${request.preferredDorm}` }, // Support "1" -> "Block 1" if user typed just block
            { number: request.preferredDorm.replace(/[^0-9]/g, '') } // Strip letters if they typed "Room 101"
          ]
        }
      });

      if (!targetRoom) {
        return res.status(400).json({ error: `Preferred room '${request.preferredDorm}' not found. Please ensure the room exists (e.g. B1-104).` });
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
router.post('/messages/broadcast', async (req, res) => {
  try {
    const { senderId, targetType, targetValue, title, content } = req.body;
    // targetType: 'all', 'block', 'department'

    let where = { role: 'student' };
    if (targetType === 'block') {
      const rooms = await Room.findAll({ where: { block: targetValue } });
      const roomIds = rooms.map(r => r.id);
      where.roomId = roomIds;
    } else if (targetType === 'department') {
      where.department = targetValue;
    }

    const students = await User.findAll({ where });

    const messages = students.map(student => ({
      senderId,
      receiverId: student.id,
      title: title || 'Broadcast Announcement',
      content,
      isRead: false
    }));

    await Message.bulkCreate(messages);

    // REAL-TIME NOTIFICATION via Socket.io
    if (req.io) {
      students.forEach(student => {
        req.io.to(student.id).emit('new_notification', {
          title: title || 'New Announcement',
          content: content
        });
      });
    }

    res.json({
      success: true,
      count: messages.length,
      message: `Broadcast successfully sent to ${messages.length} students.`
    });
  } catch (error) {
    console.error('Broadcast Error:', error);
    res.status(500).json({ error: error.message });
  }
});
router.post('/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content, title } = req.body;
    const message = await Message.create({ senderId, receiverId, content, title: title || 'New Message' });

    // REAL-TIME NOTIFICATION
    if (req.io) {
      req.io.to(receiverId).emit('new_notification', {
        title: title || 'New Message',
        content: content
      });
    }

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

router.get('/messages/unread-count', async (req, res) => {
  try {
    const { userId } = req.query;
    const count = await Message.count({
      where: { receiverId: userId, isRead: false }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ROOMMATE SWAPS ===
router.post('/swaps', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Safety check: both must have a room
    const students = await User.findAll({
      where: { id: [senderId, receiverId] }
    });

    if (students.length < 2) return res.status(404).json({ error: 'One or both students not found.' });
    if (!students[0].roomId || !students[1].roomId) {
      return res.status(400).json({ error: 'Both students must be currently allocated to a room to swap.' });
    }

    const request = await SwapRequest.create({ senderId, receiverId, status: 'Pending' });

    // Trigger a notification message to the receiver
    await Message.create({
      senderId,
      receiverId,
      title: 'Room Swap Proposal',
      content: `I would like to propose a room swap with you. Please check the "Dorm Change" section to accept or reject.`,
      isRead: false
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/swaps', async (req, res) => {
  try {
    const { userId, isAdmin } = req.query;
    let where = {};
    if (!isAdmin) {
      where = {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }]
      };
    }
    const swaps = await SwapRequest.findAll({
      where,
      include: [
        { model: User, as: 'Sender', attributes: ['name', 'id', 'roomId'] },
        { model: User, as: 'Receiver', attributes: ['name', 'id', 'roomId'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/swaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const swap = await SwapRequest.findByPk(id);
    if (!swap) return res.status(404).json({ error: 'Swap request not found.' });

    // Logic for Final Approval (Admin Only)
    if (status === 'Approved') {
      const studentA = await User.findByPk(swap.senderId);
      const studentB = await User.findByPk(swap.receiverId);

      const tempRoom = studentA.roomId;
      studentA.roomId = studentB.roomId;
      studentB.roomId = tempRoom;

      await studentA.save();
      await studentB.save();
    }

    if (status) swap.status = status;
    if (adminComment) swap.adminComment = adminComment;

    await swap.save();
    res.json({ success: true, swap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/audit', async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'Admin', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
