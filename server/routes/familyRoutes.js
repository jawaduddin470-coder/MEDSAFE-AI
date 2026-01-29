const express = require('express');
const router = express.Router();
const {
    getFamilyMembers,
    addFamilyMember,
    deleteFamilyMember,
} = require('../controllers/familyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getFamilyMembers).post(protect, addFamilyMember);
router.route('/:id').delete(protect, deleteFamilyMember);

module.exports = router;
