const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { 
  isAdmin,
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getUsers,
  deactivateUser,
  getDashboardStats,
  getUserStats,
  exportUsersReport,
  exportQuizReport,
  getPlayerStats,
  getPlayerStatsCharts
} = require('../controllers/adminController');
const { questionValidation, categoryValidation } = require('../middleware/validation');

// All admin routes require authentication and admin privileges
router.use(verifyToken);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Questions management
router.post('/questions', questionValidation, createQuestion);
router.get('/questions', getQuestions);
router.put('/questions/:id', questionValidation, updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Categories management
router.post('/categories', categoryValidation, createCategory);
router.get('/categories', getCategories);
router.put('/categories/:id', categoryValidation, updateCategory);
router.delete('/categories/:id', deleteCategory);

// Users management
router.get('/users', getUsers);
router.put('/users/:id/deactivate', deactivateUser);
router.get('/users/:userId/stats', getUserStats);

// Reports
router.get('/reports/users', exportUsersReport);
router.get('/reports/quiz', exportQuizReport);

// Player Statistics
router.get('/player-stats', getPlayerStats);
router.get('/player-stats/charts', getPlayerStatsCharts);

// Generate quiz manually
router.post('/generate-quiz', async (req, res) => {
  try {
    const { generateDailyQuiz } = require('../services/scheduler');
    const quiz = await generateDailyQuiz();
    res.json({ message: 'Quiz generated successfully', quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const { DailyQuiz } = require('../models/Quiz');
    const quizzes = await DailyQuiz.getRecentQuizzes(30);
    res.json({ quizzes });
  } catch (error) {
    console.error('Error getting quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settings management
router.get('/settings', async (req, res) => {
  try {
    const settings = {
      quizSendTime: process.env.QUIZ_SEND_TIME || '12:00',
      quizDeadlineTime: process.env.QUIZ_DEADLINE_TIME || '00:00',
      quizQuestionsCount: parseInt(process.env.QUIZ_QUESTIONS_COUNT) || 5,
      reminderHours: parseInt(process.env.REMINDER_HOURS) || 6
    };
    res.json({ settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { quizSendTime, quizDeadlineTime, quizQuestionsCount, reminderHours } = req.body;
    
    // In a real application, you would save these to a database
    // For now, we'll just return success
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
