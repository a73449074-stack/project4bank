const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// CORS for all methods (debugging)
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST /api/upload/profile-pic
router.post('/profile-pic', upload.single('profilePic'), (req, res) => {
  try {
    console.log('HEADERS:', req.headers);
    console.log('BODY:', req.body);
    if (!req.file) {
      console.error('No file uploaded:', req.body, req.headers);
      return res.status(400).json({ message: 'No file uploaded', debug: req.body });
    }
    // Return the absolute URL to the uploaded file
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
