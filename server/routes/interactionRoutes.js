const express = require('express');
const router = express.Router();
const { checkInteractions } = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check', checkInteractions);

module.exports = router;
