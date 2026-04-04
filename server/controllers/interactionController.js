const asyncHandler = require('express-async-handler');

/**
 * Drug Interaction Checker using OpenFDA API
 * Docs: https://open.fda.gov/apis/drug/label/
 */

// @desc    Check drug interactions between a list of medications
// @route   POST /api/interactions/check
// @access  Private
const checkInteractions = asyncHandler(async (req, res) => {
    const { medications } = req.body; // array of medicine name strings

    if (!medications || !Array.isArray(medications) || medications.length < 2) {
        return res.status(200).json({ interactions: [], warnings: [] });
    }

    const warnings = [];

    try {
        // Check each pair of medications against OpenFDA drug label API
        for (let i = 0; i < medications.length; i++) {
            for (let j = i + 1; j < medications.length; j++) {
                const med1 = medications[i].trim();
                const med2 = medications[j].trim();

                const interaction = await checkPair(med1, med2);
                if (interaction) {
                    warnings.push(interaction);
                }
            }
        }
    } catch (err) {
        console.error('[Interaction Check Error]:', err.message);
        // Non-blocking – return empty warnings on API failure
        return res.status(200).json({ interactions: [], warnings: [], apiError: true });
    }

    res.status(200).json({ warnings });
});

/**
 * Check if two drugs have a known interaction via OpenFDA.
 * Returns a warning object or null.
 */
async function checkPair(med1, med2) {
    try {
        const query = encodeURIComponent(`"${med1}" AND "${med2}"`);
        const url = `https://api.fda.gov/drug/label.json?search=drug_interactions:${query}&limit=1`;

        const response = await fetch(url);

        if (!response.ok) return null;

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const label = data.results[0];
            const interactionText = label.drug_interactions?.[0] || '';

            // Only flag if the second drug is actually mentioned in the interaction text
            const lowerText = interactionText.toLowerCase();
            const lowerMed2 = med2.toLowerCase();

            if (lowerText.includes(lowerMed2)) {
                return {
                    drug1: med1,
                    drug2: med2,
                    severity: 'warning',
                    message: `Taking ${med1} and ${med2} together may have interactions. Please consult your pharmacist.`,
                    detail: interactionText.substring(0, 300) + (interactionText.length > 300 ? '...' : ''),
                };
            }
        }
    } catch {
        // Silently skip on network error for each pair
    }

    // Hardcoded well-known interactions as fallback
    return checkKnownInteractions(med1, med2);
}

/**
 * Fallback: well-known dangerous drug pairs
 */
function checkKnownInteractions(med1, med2) {
    const knownPairs = [
        {
            drugs: ['aspirin', 'ibuprofen'],
            message: 'Taking Aspirin and Ibuprofen together may increase the risk of bleeding and stomach ulcers.',
            severity: 'danger',
        },
        {
            drugs: ['aspirin', 'warfarin'],
            message: 'Taking Aspirin and Warfarin together significantly increases the risk of serious bleeding.',
            severity: 'danger',
        },
        {
            drugs: ['ibuprofen', 'naproxen'],
            message: 'Taking Ibuprofen and Naproxen together (two NSAIDs) increases side-effect risk. Avoid combining.',
            severity: 'warning',
        },
        {
            drugs: ['paracetamol', 'alcohol'],
            message: 'Taking Paracetamol with alcohol can cause serious liver damage.',
            severity: 'danger',
        },
        {
            drugs: ['metformin', 'alcohol'],
            message: 'Taking Metformin with alcohol can cause lactic acidosis.',
            severity: 'danger',
        },
        {
            drugs: ['simvastatin', 'amiodarone'],
            message: 'Taking Simvastatin and Amiodarone together increases the risk of muscle damage (myopathy).',
            severity: 'warning',
        },
        {
            drugs: ['iron', 'calcium'],
            message: 'Calcium can reduce iron absorption. Take them at least 2 hours apart.',
            severity: 'info',
        },
        {
            drugs: ['iron', 'milk'],
            message: 'Milk (dairy) reduces iron absorption. Iron should not be taken with milk.',
            severity: 'info',
        },
        {
            drugs: ['lisinopril', 'potassium'],
            message: 'Taking Lisinopril with potassium supplements can cause dangerous high potassium levels.',
            severity: 'danger',
        },
    ];

    const m1 = med1.toLowerCase();
    const m2 = med2.toLowerCase();

    for (const pair of knownPairs) {
        const [d1, d2] = pair.drugs;
        if ((m1.includes(d1) && m2.includes(d2)) || (m1.includes(d2) && m2.includes(d1))) {
            return {
                drug1: med1,
                drug2: med2,
                severity: pair.severity,
                message: pair.message,
                detail: null,
            };
        }
    }

    return null;
}

module.exports = { checkInteractions };
