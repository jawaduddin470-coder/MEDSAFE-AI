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
            enum: ['none', 'daily', 'weekly'],
            default: 'none',
        },
        status: {
            type: String,
            enum: ['upcoming', 'completed', 'missed'],
            default: 'upcoming',
        },
        sent: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Reminder', reminderSchema);
