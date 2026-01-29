const express = require('express');
const router = express.Router();
const {
    getMedications,
    setMedication,
    updateMedication,
    deleteMedication,
} = require('../controllers/medicationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMedications).post(protect, setMedication);
router.route('/:id').delete(protect, deleteMedication).put(protect, updateMedication);

module.exports = router;
