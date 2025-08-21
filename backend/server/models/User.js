const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  frozen: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  // profilePic removed
  transactionPin: { type: String, default: '1234' },
  cards: [
    {
      cardNumber: String,
      cardName: String,
      expiry: String,
      linked: { type: Boolean, default: false },
    }
  ],
  chat: [
    {
      from: String,
      message: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
