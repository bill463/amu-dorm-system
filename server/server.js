const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Original express.json() middleware
// app.use(express.json());

// Body parser limit increase for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Diagnostics
app.get('/api/debug', async (req, res) => {
  const { User } = require('./models');
  let adminStatus = 'not found';
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (admin) {
      const isHashed = admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$');
      adminStatus = isHashed ? 'found (hashed)' : 'found (NOT HASHED)';
    }
  } catch (e) {
    adminStatus = 'error checking: ' + e.message;
  }

  res.json({
    db_host: process.env.DB_HOST || 'not set',
    db_name: process.env.DB_NAME || 'not set',
    db_user: process.env.DB_USER || 'not set',
    db_pass_exists: !!process.env.DB_PASS,
    port: process.env.PORT || 'not set',
    admin_status: adminStatus
  });
});

async function startServer() {
  // Start listening immediately so Railway health check passes
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  try {
    console.log('Attempting to connect to database at:', process.env.DB_HOST || 'localhost');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models
    await sequelize.sync({ alter: true });

    // Auto-seed admin if not exists
    const { User } = require('./models');

    const admin = await User.findOne({ where: { role: 'admin' } });

    if (!admin) {
      await User.create({
        id: 'admin',
        name: 'System Admin',
        password: 'admin', // beforeCreate hook will handle this
        role: 'admin',
        department: 'Administration'
      });
      console.log('Default admin user created successfully.');
    } else if (!admin.password.startsWith('$2a$') && !admin.password.startsWith('$2b$')) {
      // Force migration if password is plain text
      console.log('Migrating plain-text admin password...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(admin.password, salt);
      await admin.update({ password: hashed }, { hooks: false });
      console.log('Admin password migrated to secure hash.');
    }

    // Auto-seed rooms if none exist
    const { Room } = require('./models');
    const roomCount = await Room.count();

    if (roomCount === 0) {
      console.log('No rooms found. Seeding initial rooms...');
      // 4 Blocks, 4 Floors, 16 Rooms per floor
      for (let b = 1; b <= 4; b++) {
        for (let f = 1; f <= 4; f++) {
          for (let r = 1; r <= 16; r++) {
            const roomNum = `${f}${r.toString().padStart(2, '0')}`;
            const roomId = `B${b}-${roomNum}`; // ID Format: B1-101
            await Room.create({
              id: roomId,
              block: `Block ${b}`,
              number: roomNum,
              capacity: 6
            });
          }
        }
      }
      console.log(`Seeded rooms for 4 Blocks (4 floors, 16 rooms each).`);
    }
  } catch (error) {
    console.error('CRITICAL: Server failed to connect to database:', error);
    console.log('Check /api/debug for environment variables.');
  }
}

startServer();
