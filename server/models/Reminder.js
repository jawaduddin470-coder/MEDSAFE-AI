const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        medicineName: {
            type: String,
            required: true,
        },
        dosage: {
            type: String,
        },
        date: {
            type: String, // YYYY-MM-DD
            required: true,
        },
        time: {
            type: String, // HH:mm
            required: true,
        },
        repeat: {
            type: String,
            enum: ['none', 'daily', 'weekly', 'custom'],
            default: 'none',
        },
        intervalDays: {
            type: Number,
            default: null,
        },
        status: {
            type: String,
            enum: ['upcoming', 'completed', 'missed'],
            default: 'upcoming',
        },
        sent: {
            type: Boolean,
            default: false,
        },
        takenAt: {
            type: Date,
            default: null,
        },
        escalationCount: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            default: '',
        },
        familyMember: {
            type: String,
            default: null, // null = main user
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Reminder', reminderSchema);
