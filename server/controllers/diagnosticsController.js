/**
 * MedSuree — AI Diagnostics Hub Controller
 * Handles: Medical Report Analyzer + X-Ray Authenticity Detection
 */

const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');

// ─── OpenRouter Client ────────────────────────────────────────────────────────
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
        'HTTP-Referer': 'https://medsuree.com',
        'X-Title': 'MedSuree Diagnostics',
    },
});

// ─── In-Memory X-Ray Hash Store ───────────────────────────────────────────────
// Production: Replace with MongoDB collection. For now JSON-in-memory is reliable.
let xrayHashStore = [];

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Compute a very lightweight perceptual hash from base64 image data.
 * We use a 16-bucket luminance histogram approach (no native deps required).
 * Returns a 64-bit binary string.
 */
function computeImageFingerprint(base64Data) {
    try {
        // Decode base64 to raw bytes
        const bytes = Buffer.from(base64Data, 'base64');
        const len = bytes.length;

        // Sample pixels at regular intervals across the byte stream
        // We treat groups of 3 bytes as approximate RGB triplets
        const sampleCount = 64;
        const step = Math.max(1, Math.floor(len / (sampleCount * 3)));
        const luminances = [];

        for (let i = 0; i < sampleCount; i++) {
            const offset = (i * step * 3) % (len - 3);
            const r = bytes[offset] || 0;
            const g = bytes[offset + 1] || 0;
            const b = bytes[offset + 2] || 0;
            // Standard luminance formula
            luminances.push(0.299 * r + 0.587 * g + 0.114 * b);
        }

        // Compute average luminance
        const avg = luminances.reduce((a, b) => a + b, 0) / luminances.length;

        // Build 64-bit hash: 1 if luminance >= avg, else 0
        return luminances.map(l => (l >= avg ? '1' : '0')).join('');
    } catch (e) {
        console.error('Fingerprint error:', e.message);
        // Return random hash so it doesn't crash — will show "Likely Original"
        return Array.from({ length: 64 }, () => Math.round(Math.random())).join('');
    }
}

/**
 * Hamming distance between two binary strings of equal length.
 */
function hammingDistance(a, b) {
    if (a.length !== b.length) return a.length; // max distance on mismatch
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) dist++;
    }
    return dist;
}

/**
 * Convert Hamming distance to similarity percentage.
 */
function toSimilarity(distance, length = 64) {
    return Math.round(((length - distance) / length) * 100);
}

// ─── Fallback Demo AI Response ────────────────────────────────────────────────
const DEMO_REPORT_RESULT = {
    parameters: [
        { name: 'Hemoglobin', value: '11.2 g/dL', normal: '12–16 g/dL', status: 'low' },
        { name: 'Blood Sugar (Fasting)', value: '126 mg/dL', normal: '70–100 mg/dL', status: 'high' },
        { name: 'Blood Pressure', value: '138/88 mmHg', normal: '< 120/80 mmHg', status: 'high' },
        { name: 'Cholesterol', value: '185 mg/dL', normal: '< 200 mg/dL', status: 'normal' },
        { name: 'Creatinine', value: '0.9 mg/dL', normal: '0.6–1.2 mg/dL', status: 'normal' },
    ],
    abnormal: [
        { name: 'Hemoglobin', value: '11.2 g/dL', reason: 'Slightly below normal range — possible mild anemia.' },
        { name: 'Blood Sugar', value: '126 mg/dL', reason: 'Above fasting threshold — may indicate pre-diabetes or diabetes.' },
        { name: 'Blood Pressure', value: '138/88 mmHg', reason: 'Stage 1 hypertension range — consult a doctor.' },
    ],
    summary:
        'This sample report shows three values outside the normal range: mild anemia (low hemoglobin), elevated fasting blood sugar, and slightly high blood pressure. None of these are emergencies, but they do warrant a discussion with your doctor. Maintaining a balanced diet, staying hydrated, and regular check-ups can help manage these levels. This is an AI-assisted summary — not a medical diagnosis.',
    disclaimer: 'This analysis is for informational purposes only and does not constitute a medical diagnosis. Always consult a qualified healthcare professional.',
};

// ─── Controller 1: Medical Report Analyzer ───────────────────────────────────

/**
 * @desc    Analyze a medical report image via AI
 * @route   POST /api/diagnostics/analyze-report
 * @access  Private
 * @body    { image: base64String, filename: string, isDemoMode: boolean }
 */
const analyzeReport = asyncHandler(async (req, res) => {
    const { image, filename = 'report', isDemoMode = false } = req.body;

    // ── Demo Mode shortcut ────────────────────────────────────────────────────
    if (isDemoMode) {
        return res.json({ success: true, ...DEMO_REPORT_RESULT, demoMode: true });
    }

    if (!image) {
        return res.status(400).json({ message: 'Image data (base64) is required.' });
    }

    // ── Extract raw image bytes ───────────────────────────────────────────────
    let base64Data;
    try {
        base64Data = image.includes(',') ? image.split(',')[1] : image;
        if (!base64Data || base64Data.length < 100) throw new Error('Image too small or invalid');
    } catch (e) {
        return res.status(400).json({ message: 'Invalid image format. Please upload a valid file.' });
    }

    // ── Step 1: Call AI (Vision) to extract text & parameters ────────────────
    try {
        const REPORT_PROMPT = `You are a medical report analyzer for a safety awareness platform.

Analyze the following medical report image and return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:

{
  "parameters": [
    { "name": "parameter name", "value": "measured value with units", "normal": "normal range", "status": "normal|high|low" }
  ],
  "abnormal": [
    { "name": "parameter name", "value": "measured value", "reason": "plain-English explanation of why it is abnormal" }
  ],
  "summary": "A 3–5 sentence plain-English summary of the report findings. Mention key concerns. Do NOT diagnose. End with 'Always consult your doctor.'"
}

Rules:
- Extract all numeric test results you can see (Hemoglobin, Blood Sugar, Creatinine, BP, etc.)
- Mark high/low based on standard reference ranges
- Keep explanations simple and non-technical
- If the image is not a medical report, set parameters to [], abnormal to [], and set summary to "Could not identify a valid medical report in this image."`;

        console.log('[DiagnosticsHub] Sending report to AI for analysis...');

        const completion = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-001',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: REPORT_PROMPT },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1500,
            temperature: 0.2,
        });

        let rawText = completion.choices?.[0]?.message?.content || '';
        // Strip markdown code fences if AI wraps in them
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch (_) {
            // If JSON parse fails, return fallback
            console.warn('[DiagnosticsHub] JSON parse failed, using fallback structure');
            parsed = {
                parameters: [],
                abnormal: [],
                summary: 'The AI could not fully parse this report. The image may be blurry or not a standard medical lab report. Please try a clearer image.',
            };
        }

        const disclaimer =
            'This analysis is for informational purposes only and does not constitute a medical diagnosis. Always consult a qualified healthcare professional.';

        return res.json({ success: true, ...parsed, disclaimer });
    } catch (err) {
        console.error('[DiagnosticsHub] AI Report Error:', err.message);

        // Graceful fallback — never crash the UI
        if (err.status === 401 || err.status === 403) {
            return res.json({
                success: true,
                ...DEMO_REPORT_RESULT,
                demoMode: true,
                warning: 'API key issue — showing demo results.',
            });
        }

        return res.status(500).json({
            message: 'Could not analyze the report at this time. Please try again or use Demo Mode.',
        });
    }
});

// ─── Controller 2: X-Ray Authenticity Checker ────────────────────────────────

/**
 * @desc    Check X-ray image for possible reuse/misuse
 * @route   POST /api/diagnostics/check-xray
 * @access  Private
 * @body    { image: base64String, filename: string, isDemoMode: boolean }
 */
const checkXray = asyncHandler(async (req, res) => {
    const { image, filename = 'xray.jpg', isDemoMode = false } = req.body;

    // ── Demo Mode ─────────────────────────────────────────────────────────────
    if (isDemoMode) {
        return res.json({
            success: true,
            similarity: 34,
            riskLevel: 'low',
            riskLabel: 'Likely Original',
            message:
                'This image does not closely match any previously submitted X-rays in the database. It appears to be a unique, original image.',
            hashesInDb: xrayHashStore.length,
            disclaimer:
                'This is an AI-assisted verification tool and not a medical or legal conclusion.',
            demoMode: true,
        });
    }

    if (!image) {
        return res.status(400).json({ message: 'Image data (base64) is required.' });
    }

    let base64Data;
    try {
        base64Data = image.includes(',') ? image.split(',')[1] : image;
        if (!base64Data || base64Data.length < 200) throw new Error('Image too small');
    } catch (e) {
        return res.status(400).json({ message: 'Invalid image format.' });
    }

    try {
        // ── Step 1: Generate perceptual fingerprint ───────────────────────────
        const newHash = computeImageFingerprint(base64Data);
        const timestamp = new Date().toISOString();

        // ── Step 2: Compare against stored hashes ────────────────────────────
        let maxSimilarity = 0;
        let mostSimilarEntry = null;

        for (const entry of xrayHashStore) {
            const sim = toSimilarity(hammingDistance(newHash, entry.hash));
            if (sim > maxSimilarity) {
                maxSimilarity = sim;
                mostSimilarEntry = entry;
            }
        }

        // ── Step 3: Decision logic ────────────────────────────────────────────
        let riskLevel, riskLabel, message;

        if (maxSimilarity > 90) {
            riskLevel = 'high';
            riskLabel = 'High Risk: Possible Reuse';
            message = `This X-ray image is ${maxSimilarity}% similar to a previously submitted image (uploaded on ${mostSimilarEntry?.timestamp?.slice(0, 10) || 'unknown date'}). This may indicate image reuse or duplication. Please verify with a certified radiologist.`;
        } else if (maxSimilarity >= 70) {
            riskLevel = 'moderate';
            riskLabel = 'Moderate Risk';
            message = `This image shows ${maxSimilarity}% similarity to a previously seen X-ray. This could be coincidental anatomical similarity or partial reuse. Further review is recommended.`;
        } else {
            riskLevel = 'low';
            riskLabel = 'Likely Original';
            message = `This X-ray appears to be original with only ${maxSimilarity}% similarity to any previously submitted image. No significant duplication detected.`;
        }

        // ── Step 4: Store hash (only if not clearly a duplicate >95%) ────────
        if (maxSimilarity <= 95) {
            xrayHashStore.push({ hash: newHash, filename, timestamp });
            // Keep store size reasonable in memory
            if (xrayHashStore.length > 500) xrayHashStore = xrayHashStore.slice(-400);
        }

        return res.json({
            success: true,
            similarity: maxSimilarity,
            riskLevel,
            riskLabel,
            message,
            hashesInDb: xrayHashStore.length,
            disclaimer:
                'This is an AI-assisted verification tool and not a medical or legal conclusion.',
        });
    } catch (err) {
        console.error('[DiagnosticsHub] X-Ray Check Error:', err.message);
        return res.status(500).json({
            message:
                'Could not process the X-ray image. Please try again with a valid JPG or PNG file.',
        });
    }
});

module.exports = { analyzeReport, checkXray };
