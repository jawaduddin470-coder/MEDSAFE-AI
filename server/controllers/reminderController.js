const asyncHandler = require('express-async-handler');
const Reminder = require('../models/Reminder');

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
const getReminders = asyncHandler(async (req, res) => {
    const query = { user: req.user.id };
    if (req.query.familyMember) {
        query.familyMember = req.query.familyMember;
    }
    const reminders = await Reminder.find(query).sort({ date: 1, time: 1 });
    res.status(200).json(reminders);
});

// @desc    Create a reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = asyncHandler(async (req, res) => {
    const { medicineName, dosage, date, time, repeat, intervalDays, notes, familyMember } = req.body;

    if (!medicineName || !date || !time) {
        res.status(400);
        throw new Error('Medicine name, date and time are required');
    }

    const reminder = await Reminder.create({
        user: req.user.id,
        medicineName,
        dosage,
        date,
        time,
        repeat: repeat || 'none',
        intervalDays: intervalDays || null,
        notes: notes || '',
        familyMember: familyMember || null,
        status: 'upcoming',
        sent: false,
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

    const updatedReminder = await Reminder.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
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

    // FIX: Use findByIdAndDelete instead of deprecated reminder.remove()
    await Reminder.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id });
});

// @desc    Mark reminder as taken
// @route   PATCH /api/reminders/:id/taken
// @access  Private
const markReminderTaken = asyncHandler(async (req, res) => {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
        res.status(404);
        throw new Error('Reminder not found');
    }

    if (reminder.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    reminder.status = 'completed';
    reminder.takenAt = new Date();
    await reminder.save();

    res.status(200).json(reminder);
});

// @desc    Get adherence stats for the current user
// @route   GET /api/reminders/stats
// @access  Private
const getAdherenceStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const reminders = await Reminder.find({
        user: userId,
        date: { $gte: sevenDaysAgoStr },
    });

    const total = reminders.length;
    const taken = reminders.filter(r => r.status === 'completed').length;
    const missed = reminders.filter(r => r.status === 'missed').length;
    const adherenceScore = total > 0 ? Math.round((taken / total) * 100) : 100;

    // Build daily breakdown for chart
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dailyMap[key] = { taken: 0, missed: 0, total: 0 };
    }

    reminders.forEach(r => {
        if (dailyMap[r.date]) {
            dailyMap[r.date].total++;
            if (r.status === 'completed') dailyMap[r.date].taken++;
            else if (r.status === 'missed') dailyMap[r.date].missed++;
        }
    });

    // Calculate streak
    let streak = 0;
    const days = Object.keys(dailyMap).sort().reverse();
    for (const day of days) {
        const d = dailyMap[day];
        if (d.total === 0) continue;
        if (d.missed === 0 && d.taken > 0) streak++;
        else break;
    }

    res.status(200).json({
        total,
        taken,
        missed,
        adherenceScore,
        streak,
        daily: dailyMap,
    });
});

module.exports = {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markReminderTaken,
    getAdherenceStats,
};
