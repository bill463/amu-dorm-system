const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-it';

// Temporary storage for pending registrations (Use Redis or DB in prod)
const pendingRegistrations = new Map();

router.post('/register-init', async (req, res) => {
  try {
    const { id, name, department, email } = req.body;

    // 1. Domain Check
    if (!email.endsWith('@amu.edu.et')) {
      return res.status(400).json({ success: false, message: 'Invalid email domain. Must be @amu.edu.et' });
    }

    // 2. Check Exists
    const existingUser = await User.findOne({ where: { id } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Student ID already registered.' });
    }
    // Check if email used? (Assuming email field exists on User or checking ID is enough for now)
    // We don't have email column in User model explicitly in the snippet I saw earlier?
    // Wait, User model had: id, name, password, role, department, profilePicture, roomId.
    // Ensure we store email!
    // I need to add 'email' or 'contactInfo' to User model if I want to save it.
    // The previous profile update code tried to update 'email'.
    // If the model doesn't have it, it will fail.
    // I should add email to User model too!

    // 3. Generate Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Store Pending
    pendingRegistrations.set(email, {
      id, name, department, email, code,
      expires: Date.now() + 10 * 60 * 1000 // 10 mins
    });

    // 5. "Send Email" (Mock)
    console.log(`[MOCK EMAIL SERVICE] Sending code ${code} to ${email}`);

    res.json({ success: true, message: 'Verification code sent to your email.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/register-verify', async (req, res) => {
  try {
    const { email, code, password } = req.body;

    const record = pendingRegistrations.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'Registration session expired or invalid.' });
    }

    if (record.code !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (Date.now() > record.expires) {
      pendingRegistrations.delete(email);
      return res.status(400).json({ success: false, message: 'Code expired. Please try again.' });
    }

    // Create User
    // Use stored data + new password
    // Need to handle 'email' field in User model if it's not there.
    // I will add email to User model in next step if checking reveals it's missing.
    // For now assuming we add it.

    await User.create({
      id: record.id,
      name: record.name,
      department: record.department,
      password: password,
      role: 'student',
      email: record.email
    });

    pendingRegistrations.delete(email);

    res.json({ success: true, message: 'Account created successfully.' });

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
