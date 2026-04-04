/**
 * MedSuree — AI Diagnostics Hub Routes
 */

const express = require('express');
const router = express.Router();
const { analyzeReport, checkXray } = require('../controllers/diagnosticsController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/diagnostics/analyze-report  → Medical Report Analyzer
router.post('/analyze-report', protect, analyzeReport);

// POST /api/diagnostics/check-xray      → X-Ray Authenticity Check
router.post('/check-xray', protect, checkXray);

module.exports = router;
