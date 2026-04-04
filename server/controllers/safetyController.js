const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const Medication = require('../models/Medication');
const Reminder = require('../models/Reminder');
const AnalysisLog = require('../models/AnalysisLog');

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
        "HTTP-Referer": "https://medsuree.com",
        "X-Title": "MedSuree Safety Engine",
    }
});

const SYSTEM_PROMPT = "You are a Medication Safety Intelligence Engine. Your goal is to analyze a list of medications and their schedules to identify potential risks: drug interactions, overdose frequency, duplicate medicines, and food conflicts. Provide a 0-100 safety score (higher is safer), a list of specific alerts with severity, and smart recommendations. Respond ONLY in JSON format.";

/**
 * @desc    Run a deep safety audit for current user
 * @route   POST /api/safety/audit
 * @access  Private
 */
const runSafetyAudit = asyncHandler(async (req, res) => {
    const meds = await Medication.find({ user: req.user.id });
    const reminders = await Reminder.find({ user: req.user.id });

    if (!meds || meds.length === 0) {
        return res.status(200).json({
            safetyScore: 100,
            alerts: [],
            recommendations: ["Add your medications to start the safety audit."],
            riskLevel: "Low"
        });
    }

    // Prepare data for OpenRouter
    const safetyContext = {
        medications: meds.map(m => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            timeOfDay: m.timeOfDay,
            notes: m.notes
        })),
        schedule: reminders.slice(-20).map(r => ({
            medicine: r.medicineName,
            time: r.time,
            date: r.date,
            status: r.status
        }))
    };

    try {
        const prompt = `Perform a safety audit on these medications and schedule: \n${JSON.stringify(safetyContext)} \n\nReturn JSON with schema: { "safetyScore": number, "riskLevel": "Low"|"Moderate"|"High", "alerts": [ { "type": string, "severity": "High"|"Medium"|"Low", "message": string, "detail": string } ], "recommendations": [ string ] }`;

        console.log('Running Safety Audit via OpenRouter...');

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        let text = completion.choices[0].message.content;

        // Clean markdown JSON if present (though response_format should handle it)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const auditData = JSON.parse(text);

        // Log the analysis
        await AnalysisLog.create({
            user: req.user.id,
            medications: meds.map(m => m.name),
            riskLevel: auditData.riskLevel,
            interactions: (auditData.alerts || [])
                .filter(a => a.type.toLowerCase().includes('interaction'))
                .map(a => ({
                    med1: 'N/A',
                    med2: 'N/A',
                    description: a.message,
                    severity: a.severity
                })),
            summary: (auditData.recommendations || []).join(' ')
        });

        res.status(200).json(auditData);
    } catch (error) {
        console.error("Safety Audit Error:", error);
        res.status(500).json({ message: "Failed to run safety audit. Please try again later." });
    }
});

module.exports = {
    runSafetyAudit,
};
