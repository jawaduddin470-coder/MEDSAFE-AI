const express = require('express');
const router = express.Router();
const {
    checkinteractions,
    getAnalysisHistory,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.post('/check', protect, checkinteractions);
router.get('/history', protect, getAnalysisHistory);

module.exports = router;
