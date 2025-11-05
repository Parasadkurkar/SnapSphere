const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const checkMutualFollow = async (userId1, userId2) => {
  try {
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) return false;

    const user1FollowsUser2 = user1.following.some(
      id => id.toString() === userId2.toString()
    );

    const user2FollowsUser1 = user2.following.some(
      id => id.toString() === userId1.toString()
    );

    return user1FollowsUser2 && user2FollowsUser1;
  } catch (err) {
    console.error('Error checking mutual follow:', err);
    return false;
  }
};

// Get all conversations with unread count
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    })
      .populate('sender', 'name username profilePic')
      .populate('receiver', 'name username profilePic')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user.id },
          read: false
        });
        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get conversation with specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;

    const isMutual = await checkMutualFollow(currentUserId, otherUserId);

    if (!isMutual) {
      return res.status(403).json({ 
        message: 'You can only message users who follow you back'
      });
    }

    let conversation = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name username profilePic')
      .populate('receiver', 'name username profilePic');

    if (!conversation) {
      conversation = new Conversation({
        sender: currentUserId,
        receiver: otherUserId
      });
      await conversation.save();
      await conversation.populate('sender', 'name username profilePic');
      await conversation.populate('receiver', 'name username profilePic');
    }

    const messages = await Message.find({
      conversation: conversation._id
    })
      .populate('sender', 'name username profilePic')
      .sort({ createdAt: 1 });

    // Mark all messages from other user as read
    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: otherUserId,
        read: false
      },
      { read: true }
    );

    res.json({ conversation, messages });
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ message: 'Error fetching conversation' });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const currentUserId = req.user.id;

    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }

    const isMutual = await checkMutualFollow(currentUserId, receiverId);

    if (!isMutual) {
      return res.status(403).json({ 
        message: 'You can only message users who follow you back'
      });
    }

    let conversation = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: receiverId },
        { sender: receiverId, receiver: currentUserId }
      ]
    });

    if (!conversation) {
      conversation = new Conversation({
        sender: currentUserId,
        receiver: receiverId
      });
      await conversation.save();
    }

    const message = new Message({
      conversation: conversation._id,
      sender: currentUserId,
      text,
      read: false  // ← New messages are unread
    });

    await message.save();
    await message.populate('sender', 'name username profilePic');

    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Error deleting message' });
  }
});

module.exports = router;