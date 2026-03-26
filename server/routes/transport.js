const express = require('express');
const router = express.Router();
const { getTransport, getNavigation } = require('../controllers/transportController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getTransport);
router.get('/navigate', protect, getNavigation);

module.exports = router;
