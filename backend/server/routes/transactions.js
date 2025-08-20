const router = require('express').Router();
// Admin: Reset all user balances to 0 and delete all transactions (single source of truth)
router.post('/admin/reset-all', async (req, res) => {
  try {
    await require('../models/User');
    await require('../models/Transaction');
    const User = require('mongoose').model('User');
    const Transaction = require('mongoose').model('Transaction');
    await User.updateMany({}, { balance: 0 });
    await Transaction.deleteMany({});
    res.json({ message: 'All user balances set to 0 and all transactions deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Admin: Reset all users' transactionPin to '1234'
router.post('/admin/reset-all-pins', async (req, res) => {
  try {
    const User = require('mongoose').model('User');
    await User.updateMany({}, { transactionPin: '1234' });
    res.json({ message: "All users' transaction PINs reset to 1234." });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Admin: Reset all user balances to 0 and delete all transactions
router.post('/admin/reset-all', async (req, res) => {
  try {
    await require('../models/User');
    await require('../models/Transaction');
    const User = require('mongoose').model('User');
    const Transaction = require('mongoose').model('Transaction');
    await User.updateMany({}, { balance: 0 });
    await Transaction.deleteMany({});
    res.json({ message: 'All user balances set to 0 and all transactions deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Delete all transactions for a user and reset balance
router.delete('/reset/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Delete all transactions for this user
    await Transaction.deleteMany({ user: userId });
    // Reset user balance to 0
    await User.findByIdAndUpdate(userId, { balance: 0 });
    res.json({ message: 'All transactions deleted and balance reset.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
const Transaction = require('../models/Transaction');
const User = require('../models/User');
// ...existing code...

// Create transaction (user)
router.post('/', async (req, res) => {
  try {
    const { userId, type, amount, from, to } = req.body;
    // Check if user is blocked or frozen
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.blocked || user.locked || user.frozen) {
      return res.status(403).json({ message: 'Account is blocked or frozen. Transaction not allowed.' });
    }
    // Always create as pending
    const tx = new Transaction({ user: userId, type, amount, from, to, status: 'pending' });
    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all transactions (admin)
// Get all transactions (admin or user)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) {
      query.user = userId;
      // Do not filter by status, return all for reset to work
    }
    const txs = await Transaction.find(query).populate('user', 'name email');
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update transaction status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    // Only update if status is changing
    if (tx.status !== status) {
      tx.status = status;
      await tx.save();
      // Update user balance if approved/declined
      if (status === 'approved') {
        const user = await User.findById(tx.user);
        if (user) {
          if (tx.type === 'deposit') user.balance += tx.amount;
          if (tx.type === 'withdraw' || tx.type === 'transfer') user.balance -= tx.amount;
          await user.save();
        }
      }
      // If declined, do not change balance
    }
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete transaction (admin)
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
