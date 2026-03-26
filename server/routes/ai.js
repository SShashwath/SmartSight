const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { analyzeImage, transcribeVoice } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Configure storage to preserve file extensions
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

router.post('/analyze', protect, analyzeImage);
router.post('/transcribe', protect, upload.single('audio'), transcribeVoice);

module.exports = router;


