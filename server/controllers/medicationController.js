const asyncHandler = require('express-async-handler');
const Medication = require('../models/Medication');
const User = require('../models/User');

// @desc    Get medications
// @route   GET /api/medications
// @access  Private
const getMedications = asyncHandler(async (req, res) => {
    const medications = await Medication.find({ user: req.user.id });
    res.status(200).json(medications);
});

// @desc    Set medication
// @route   POST /api/medications
// @access  Private
const setMedication = asyncHandler(async (req, res) => {
    if (!req.body.name) {
        res.status(400);
        throw new Error('Please add a medication name');
    }

    const medication = await Medication.create({
        user: req.user.id,
        name: req.body.name,
        dosage: req.body.dosage,
        frequency: req.body.frequency,
        timeOfDay: req.body.timeOfDay,
        notes: req.body.notes,
    });

    res.status(200).json(medication);
});

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
const updateMedication = asyncHandler(async (req, res) => {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
        res.status(400);
        throw new Error('Medication not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the goal user
    if (medication.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedMedication = await Medication.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).json(updatedMedication);
});

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
const deleteMedication = asyncHandler(async (req, res) => {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
        res.status(400);
        throw new Error('Medication not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the goal user
    if (medication.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await medication.remove();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getMedications,
    setMedication,
    updateMedication,
    deleteMedication,
};
