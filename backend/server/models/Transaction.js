const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer', 'airtime', 'internet', 'gaming', 'cabletv'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'approved', 'declined'], default: 'pending' },
  from: String, // for admin top-up or transfer
  to: String,   // for transfer
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
