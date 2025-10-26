const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { getTodayQuiz, submitQuiz, getQuizResult, getUserQuizHistory, getLeaderboard } = require('../controllers/quizController');
const { quizAnswerValidation } = require('../middleware/validation');

// All quiz routes require authentication
router.use(verifyToken);

// Get today's quiz
router.get('/today', getTodayQuiz);

// Submit quiz answers
router.post('/submit', quizAnswerValidation, submitQuiz);

// Get quiz result
router.get('/result/:quizId', getQuizResult);

// Get user's quiz history
router.get('/history', getUserQuizHistory);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
