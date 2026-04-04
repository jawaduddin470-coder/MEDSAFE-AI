const express = require('express');
const router = express.Router();
const {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markReminderTaken,
    getAdherenceStats,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getAdherenceStats);

router.route('/')
    .get(getReminders)
    .post(createReminder);

router.route('/:id')
    .put(updateReminder)
    .delete(deleteReminder);

router.patch('/:id/taken', markReminderTaken);

module.exports = router;
