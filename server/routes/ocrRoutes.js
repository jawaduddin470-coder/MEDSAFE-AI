const express = require('express');
const router = express.Router();
const { scanMedicationImage, scanPrescription } = require('../controllers/ocrController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scan', protect, scanMedicationImage);
router.post('/prescription', protect, scanPrescription);

module.exports = router;
