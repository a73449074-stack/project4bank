require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const fs = require('fs');
const app = express();

// Only create uploads directory if running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  const uploadsDir = require('path').join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
}
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (req, res) => {
  res.send('Mobile Banking API is running');
});


app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
  // Profile picture upload route removed


// For Vercel: export the app instead of listening
module.exports = app;

// Start server locally if not required by another module (for Vercel compatibility)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
