const mongoose = require('mongoose');

const medicationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        profileId: {
            type: mongoose.Schema.Types.ObjectId, // Optional: if strictly linked to a sub-profile
        },
        name: {
            type: String,
            required: [true, 'Please add a medication name'],
        },
        dosage: {
            type: String,
            required: [true, 'Please add dosage (e.g., 500mg)'],
        },
        frequency: {
            type: String, // e.g., "Once daily", "Twice daily"
            required: true,
        },
        timeOfDay: [{
            type: String,
            enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'As needed'],
        }],
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Medication', medicationSchema);
