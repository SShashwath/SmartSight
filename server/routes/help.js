const express = require('express');
const router = express.Router();
const { requestHelp, acceptHelp, getMyRequests } = require('../controllers/helpController');
const { protect } = require('../middleware/auth');

router.post('/request', protect, requestHelp);
router.post('/accept', protect, acceptHelp);
router.get('/my-requests', protect, getMyRequests);

module.exports = router;
