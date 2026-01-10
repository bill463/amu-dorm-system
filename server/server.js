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

// Root route
app.get('/', (req, res) => {
  res.send('AMU Dorm System API is running. Visit /api/health for status.');
});

async function startServer() {
  try {
    console.log('Connecting to database at:', process.env.DB_HOST || 'localhost');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models (alter: true updates schema without dropping tables)
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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
