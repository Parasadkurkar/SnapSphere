const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // USERNAME IS MANDATORY
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    // Check if user exists by email
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if username is taken
    let userWithUsername = await User.findOne({ username: username.toLowerCase() });
    if (userWithUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default profile pic
    user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      profilePic: 'https://via.placeholder.com/150?text=' + name.charAt(0),
      bio: ''
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, name: user.name, username: user.username, profilePic: user.profilePic },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully. Please set up your profile.',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        username: user.username,
        email: user.email, 
        profilePic: user.profilePic,
        bio: user.bio
      }
    });
  } catch (err) {
    console.error('Register error:', err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `This ${field} is already registered` });
    }

    res.status(500).json({ message: 'Error registering user' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, username: user.username, profilePic: user.profilePic },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        username: user.username,
        email: user.email, 
        profilePic: user.profilePic,
        bio: user.bio
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router;