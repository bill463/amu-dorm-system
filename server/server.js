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
app.get('/api/debug', (req, res) => {
  res.json({
    db_host: process.env.DB_HOST || 'not set',
    db_name: process.env.DB_NAME || 'not set',
    db_user: process.env.DB_USER || 'not set',
    db_pass_exists: !!process.env.DB_PASS,
    port: process.env.PORT || 'not set'
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
    const adminExists = await User.findByPk('admin');
    if (!adminExists) {
      await User.create({
        id: 'admin',
        name: 'System Admin',
        password: 'admin',
        role: 'admin',
        department: 'Administration'
      });
      console.log('Admin user auto-created.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    console.log('Server is still running, check /api/debug for environment variables.');
  }
}

startServer();
