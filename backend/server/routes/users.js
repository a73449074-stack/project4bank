const express = require('express');
const router = express.Router();
const User = require('../models/User');
// Block user (admin)
router.patch('/:id/block', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: true }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Unblock user (admin)
router.patch('/:id/unblock', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: false }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Freeze user (admin)
router.patch('/:id/freeze', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { frozen: true }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Unfreeze user (admin)
router.patch('/:id/unfreeze', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { frozen: false }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Get a single user by ID
const Transaction = require('../models/Transaction');
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Recalculate balance from all approved transactions
    const txs = await Transaction.find({ user: user._id, status: 'approved' });
    let balance = 0;
    txs.forEach(tx => {
      if (tx.type === 'deposit') balance += tx.amount;
      if (tx.type === 'withdraw' || tx.type === 'transfer') balance -= tx.amount;
    });
    user.balance = balance;
    await user.save(); // Persist recalculated balance
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:id/cards - update cards array (use correct schema fields)
router.patch('/:id/cards', async (req, res) => {
  try {
    let { cards } = req.body;
    // Ensure all cards have correct fields
    cards = (cards || []).map(card => ({
      cardNumber: card.cardNumber,
      cardName: card.cardName,
      expiry: card.expiry,
      linked: card.linked || false
    }));
    const user = await User.findByIdAndUpdate(req.params.id, { cards }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Set or update transaction password
router.patch('/:id/transaction-pin', async (req, res) => {
  try {
    console.log('PATCH /:id/transaction-pin called');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    const { transactionPin } = req.body;
    if (!transactionPin) {
      console.log('No transactionPin provided');
      return res.status(400).json({ message: 'PIN required' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { transactionPin },
      { new: true }
    );
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('PIN updated for user:', user._id);
    res.json(user);
  } catch (err) {
    console.error('Error in /:id/transaction-pin:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Update user profile (name, profilePic)
router.patch('/:id/profile', async (req, res) => {
  try {
    const { name, profilePic } = req.body;
    const update = {};
    if (name) update.name = name;
    if (profilePic) update.profilePic = profilePic;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve user (admin)
router.patch('/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Block, lock, or delete user (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { locked, blocked } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { locked, blocked }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
