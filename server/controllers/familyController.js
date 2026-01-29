const asyncHandler = require('express-async-handler');
const FamilyMember = require('../models/FamilyMember');

// @desc    Get family members
// @route   GET /api/family
// @access  Private
const getFamilyMembers = asyncHandler(async (req, res) => {
    const members = await FamilyMember.find({ user: req.user.id });
    res.status(200).json(members);
});

// @desc    Add family member
// @route   POST /api/family
// @access  Private
const addFamilyMember = asyncHandler(async (req, res) => {
    const { name, relation, age } = req.body;

    if (!name || !relation) {
        res.status(400);
        throw new Error('Please include name and relationship');
    }

    const member = await FamilyMember.create({
        user: req.user.id,
        name,
        relation,
        age
    });

    res.status(201).json(member);
});

// @desc    Delete family member
// @route   DELETE /api/family/:id
// @access  Private
const deleteFamilyMember = asyncHandler(async (req, res) => {
    const member = await FamilyMember.findById(req.params.id);

    if (!member) {
        res.status(404);
        throw new Error('Family member not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the member user
    if (member.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await member.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getFamilyMembers,
    addFamilyMember,
    deleteFamilyMember,
};
