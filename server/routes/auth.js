const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-it';

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
