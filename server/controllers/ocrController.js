const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
        "HTTP-Referer": "https://medsuree.com",
        "X-Title": "MedSuree OCR Engine",
    }
});

/**
 * @desc    Extract medication info from image (OCR)
 * @route   POST /api/ocr/scan
 * @access  Private
 */
const scanMedicationImage = asyncHandler(async (req, res) => {
    const { image } = req.body; // base64 string

    if (!image) {
        return res.status(400).json({ message: "Image data is required (base64)." });
    }

    try {
        const base64Data = image.split(',')[1] || image;

        console.log('Running OCR Scan via OpenRouter...');

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract medication information from this image. Look for: 1. Medicine Name, 2. Dosage (e.g., 500mg, 10ml), 3. Frequency (e.g., Once daily, Twice daily), 4. Instructions/Notes. Return ONLY a JSON object with keys: name, dosage, frequency, notes. If any data is missing, use an empty string." },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" }
        });

        let text = completion.choices[0].message.content;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const extractedData = JSON.parse(text);
        res.status(200).json(extractedData);

    } catch (error) {
        console.error("OCR Scan Error:", error);
        res.status(500).json({ message: "Failed to extract data from image. Error: " + error.message });
    }
});

/**
 * @desc    Extract multiple medications from prescription image
 * @route   POST /api/ocr/prescription
 * @access  Private
 */
const scanPrescription = asyncHandler(async (req, res) => {
    const { image } = req.body; // base64 string

    if (!image) {
        return res.status(400).json({ message: "Prescription image is required." });
    }

    try {
        const base64Data = image.split(',')[1] || image;

        console.log('Running Prescription Scan via OpenRouter...');

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this medical prescription. Extract all medications listed. For each medication, find: 1. Medicine Name, 2. Dosage, 3. Frequency, 4. Duration (if mentioned). Return ONLY a JSON array of objects with keys: name, dosage, frequency, notes." },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" }
        });

        let text = completion.choices[0].message.content;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);
        const medications = Array.isArray(data) ? data : (data.medications || []);

        res.status(200).json({ medications });

    } catch (error) {
        console.error("Prescription OCR Error:", error);
        res.status(500).json({ message: "Failed to parse prescription. Error: " + error.message });
    }
});

module.exports = {
    scanMedicationImage,
    scanPrescription,
};
