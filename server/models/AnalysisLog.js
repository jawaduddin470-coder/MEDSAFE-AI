const mongoose = require('mongoose');

const analysisLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    medications: [{ // List of medication names analyzed
        type: String,
    }],
    riskLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'High', 'Unknown'],
        required: true,
    },
    interactions: [{
        med1: String,
        med2: String,
        description: String,
        severity: String,
    }],
    summary: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('AnalysisLog', analysisLogSchema);
