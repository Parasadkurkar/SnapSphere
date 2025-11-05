const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

const isValidObjectId = (id) => {
  if (!id || id === 'undefined' || id === 'null') return false;
  return mongoose.Types.ObjectId.isValid(id);
};

// ============ SPECIFIC ROUTES (MUST BE FIRST) ============

// Get current user with POPULATED followers and following
router.get('/current/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('followers', 'name username profilePic')
      .populate('following', 'name username profilePic');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('followers', 'name username profilePic')
      .populate('following', 'name username profilePic');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search/query/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.id }
    }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .limit(20);
    res.json(users);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, profilePic } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;

    await user.save();
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// ============ PARAM ROUTES (MUST BE LAST) ============

router.get('/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:userId/stats', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      followers: user.followers.length,
      following: user.following.length,
      name: user.name,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const userToFollowId = req.params.userId;
    const currentUserId = req.user.id;

    if (!isValidObjectId(userToFollowId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (userToFollowId === currentUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userToFollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.some(
      id => id.toString() === userToFollowId
    );

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollowId
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUserId
      );
      await currentUser.save();
      await userToFollow.save();
      res.json({ message: 'Unfollowed', following: false });
    } else {
      currentUser.following.push(userToFollowId);
      userToFollow.followers.push(currentUserId);
      await currentUser.save();
      await userToFollow.save();

      const theyFollowMe = userToFollow.following.some(
        id => id.toString() === currentUserId
      );

      try {
        if (theyFollowMe) {
          const acceptNotif = new Notification({
            type: 'follow_accepted',
            from: currentUserId,
            to: userToFollowId,
            message: `${currentUser.name} accepted your follow request`
          });
          await acceptNotif.save();

          await Notification.updateOne(
            { from: userToFollowId, to: currentUserId, type: 'follow', read: false },
            { read: true }
          );
        } else {
          const notification = new Notification({
            type: 'follow',
            from: currentUserId,
            to: userToFollowId,
            message: `${currentUser.name} started following you`
          });
          await notification.save();
        }
      } catch (notifErr) {
        console.error('Notification error:', notifErr);
      }

      res.json({ message: 'Followed', following: true });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;