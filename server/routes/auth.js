const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.patch('/change-password', async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // In production, compare hashed password
    if (user.password !== currentPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword; // In production, hash this!
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
    // Note: In a real app, use bcrypt to compare hashed passwords!
    const user = await User.findOne({ where: { id, password } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userData = user.toJSON();
    delete userData.password; // Don't send password back
    res.json({ success: true, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

module.exports = router;
