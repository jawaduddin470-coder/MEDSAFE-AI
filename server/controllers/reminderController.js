const asyncHandler = require('express-async-handler');
const Reminder = require('../models/Reminder');

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
const getReminders = asyncHandler(async (req, res) => {
    const reminders = await Reminder.find({ user: req.user.id });
    res.status(200).json(reminders);
});

// @desc    Create a reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = asyncHandler(async (req, res) => {
    const { medicineName, dosage, date, time, repeat } = req.body;

    const reminder = await Reminder.create({
        user: req.user.id,
        medicineName,
        dosage,
        date,
        time,
        repeat,
    });

    res.status(201).json(reminder);
});

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = asyncHandler(async (req, res) => {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
        res.status(404);
        throw new Error('Reminder not found');
    }

    if (reminder.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedReminder);
});

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = asyncHandler(async (req, res) => {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
        res.status(404);
        throw new Error('Reminder not found');
    }

    if (reminder.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await reminder.remove();
    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
};
