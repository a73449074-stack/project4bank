const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');

// Get chat history between two users
router.get('/:userId/:adminId', async (req, res) => {
  try {
    const { userId, adminId } = req.params;
    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: adminId },
        { sender: adminId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
