const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, verifyToken } = require('../controllers/authController');
const { registerValidation, loginValidation, updateProfileValidation } = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);


// Protected routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfileValidation, updateProfile);
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
