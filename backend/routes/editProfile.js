const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// Update Profile - PUT /api/users/update
router.put('/update', auth, async (req, res) => {
  try {
    const { name, bio, profilePic } = req.body;
    
    console.log('Profile update request received');
    console.log('User ID:', req.user.id);

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, updating fields...');

    // Update fields - SIMPLE AND SAFE
    if (name && name.trim()) {
      user.name = name.trim();
      console.log('Name updated');
    }

    if (bio !== undefined) {
      user.bio = bio ? bio.trim() : '';
      console.log('Bio updated');
    }

    if (profilePic && profilePic.trim()) {
      user.profilePic = profilePic;
      console.log('Profile picture updated');
    }

    // Save user - THIS IS ALL WE DO!
    console.log('Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully');

    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    
    console.log('✅ Profile update completed successfully');
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });

  } catch (err) {
    console.error('❌ ERROR in profile update:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    
    res.status(500).json({ 
      message: 'Error updating profile',
      error: err.message
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('followers', 'name username profilePic')
      .populate('following', 'name username profilePic');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

module.exports = router;