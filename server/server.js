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

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models (alter: true updates schema without dropping tables)
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
