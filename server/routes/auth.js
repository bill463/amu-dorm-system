const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-it';

router.post('/register', async (req, res) => {
  try {
    const { id, name, department, email, password } = req.body;

    // 1. Basic Validation
    if (!id || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // 2. Check Exists
    const existingUser = await User.findOne({ where: { id } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Student ID already registered.' });
    }

    // 3. Create User Directly
    await User.create({
      id,
      name,
      department,
      password,
      role: 'student',
      email
    });

    res.json({ success: true, message: 'Account created successfully. Please log in.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating account.' });
  }
});

router.patch('/change-password', async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userData = user.toJSON();
    delete userData.password;

    // Sign JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, user: userData, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

module.exports = router;

module.exports = router;
