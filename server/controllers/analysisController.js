const asyncHandler = require('express-async-handler');
const AnalysisLog = require('../models/AnalysisLog');

// MOCK DATA for interactions
const INTERACTION_DATABASE = {
    'Aspirin': ['Warfarin', 'Ibuprofen', 'Heparin'],
    'Warfarin': ['Aspirin', 'Vitamin K', 'Antibiotics'],
    'Ibuprofen': ['Aspirin', 'Lithium', 'Methotrexate'],
    'Lisinopril': ['Potassium Supplements', 'Diuretics'],
    'Metformin': ['Alcohol', 'Insulin'],
};

// @desc    Run risk analysis
// @route   POST /api/analysis/check
// @access  Private
const checkinteractions = asyncHandler(async (req, res) => {
    const { medications } = req.body; // Array of med names

    if (!medications || medications.length < 2) {
        // If only 1 med, risk is low usually (unless inherent risk, but keeping it simple)
        const log = await AnalysisLog.create({
            user: req.user.id,
            medications,
            riskLevel: 'Low',
            interactions: [],
            summary: 'Single medication checked. No interactions found.',
        });
        return res.status(200).json(log);
    }

    let interactionsFound = [];
    let riskLevel = 'Low';

    // Naive O(N^2) check for demo purposes
    for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
            const med1 = medications[i];
            const med2 = medications[j];

            // Check database (case insensitive logic needed ideally, but keeping simple for now)
            // Assuming user types "Aspirin" exactly as in DB

            const conflicts1 = INTERACTION_DATABASE[med1] || [];
            if (conflicts1.includes(med2)) {
                interactionsFound.push({
                    med1,
                    med2,
                    description: `Potential interaction between ${med1} and ${med2}. May increase risk of bleeding or side effects.`,
                    severity: 'High'
                });
                riskLevel = 'High';
            }
        }
    }

    if (interactionsFound.length > 0 && riskLevel !== 'High') {
        riskLevel = 'Moderate';
    }

    const log = await AnalysisLog.create({
        user: req.user.id,
        medications,
        riskLevel,
        interactions: interactionsFound,
        summary: interactionsFound.length > 0
            ? `Found ${interactionsFound.length} potential interactions.`
            : 'No common interactions found between these medications.',
    });

    res.status(200).json(log);
});

// @desc    Get analysis history
// @route   GET /api/analysis/history
// @access  Private
const getAnalysisHistory = asyncHandler(async (req, res) => {
    const history = await AnalysisLog.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(history);
});

module.exports = {
    checkinteractions,
    getAnalysisHistory,
};
