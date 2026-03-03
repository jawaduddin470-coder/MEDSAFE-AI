const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateSubscription,
    addFcmToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/subscription', protect, updateSubscription);
router.post('/fcm-token', protect, addFcmToken);

module.exports = router;
