const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const geminiKeyManager = require('../utils/geminiKeyManager');

// POST /api/ai/chat — Main AI assistant endpoint
router.post('/chat', chatWithAI);

// GET /api/ai/status — Key pool health (safe: no key values exposed)
router.get('/status', (req, res) => {
    const status = geminiKeyManager.getStatus();
    res.json({
        ok: status.keysAvailable > 0,
        ...status,
        message: status.keysAvailable > 0
            ? `AI is operational. Using key #${status.currentKeyIndex} of ${status.totalKeys}.`
            : 'All API keys are in cooldown. Retrying soon...',
    });
});

module.exports = router;
