const express = require('express');
const router = express.Router();
const { runSafetyAudit } = require('../controllers/safetyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/audit', protect, runSafetyAudit);

module.exports = router;
