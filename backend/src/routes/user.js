const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const User = require('../models/User');
const { UserQuizAttempt } = require('../models/Quiz');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

// Submit feedback
router.post('/feedback', verifyToken, async (req, res) => {
  try {
    const { rating, comment, feedbackType = 'general' } = req.body;
    const userId = req.user.userId;

    await Feedback.createFeedback({
      userId,
      rating,
      comment,
      feedbackType
    });

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user notifications
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await Notification.getUserNotifications(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.markAsRead(id, userId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mongoose = require('mongoose');

    // Get user basic info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get quiz attempt statistics
    const attemptStats = await UserQuizAttempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$userId',
          total_attempts: { $sum: 1 },
          completed_attempts: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          avg_score: { $avg: { $cond: ['$isCompleted', '$score', null] } },
          last_quiz_date: { $max: '$completedAt' }
        }
      }
    ]);

    const stats = attemptStats[0] || { 
      total_attempts: 0, 
      completed_attempts: 0, 
      avg_score: 0, 
      last_quiz_date: null 
    };

    res.json({
      userStats: {
        total_score: user.totalScore || 0,
        tests_completed: user.testsCompleted || 0,
        total_attempts: stats.total_attempts,
        completed_attempts: stats.completed_attempts,
        avg_score: Math.round(stats.avg_score || 0),
        last_quiz_date: stats.last_quiz_date
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
