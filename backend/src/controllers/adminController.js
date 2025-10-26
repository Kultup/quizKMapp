const { validationResult } = require('express-validator');
const Question = require('../models/Question');
const Category = require('../models/Category');
const User = require('../models/User');
const { DailyQuiz, UserQuizAttempt } = require('../models/Quiz');
const { mongoose } = require('../database/connection');
const XLSX = require('xlsx');

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Questions management
const createQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const questionData = req.body;
    const question = await Question.create(questionData);

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 20, categoryId, isActive } = req.query;
    const offset = (page - 1) * limit;

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const questions = await Question.getAll(filters);

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const question = await Question.update(parseInt(id), updateData);

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await Question.delete(parseInt(id));

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Categories management
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryData = req.body;
    const category = await Category.create(categoryData);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.getWithQuestionCount();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.update(parseInt(id), updateData);

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.delete(parseInt(id));

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Users management
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const users = await User.getAll(parseInt(limit), parseInt(offset));

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.deactivate(id);

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Statistics
const getDashboardStats = async (req, res) => {
  try {
    const [userStats, questionStats, quizStats, attemptStats] = await Promise.all([
      User.getStats(),
      Question.getStats(),
      DailyQuiz.getQuizStats(),
      UserQuizAttempt.getAttemptStats()
    ]);

    res.json({
      users: {
        total_users: userStats.totalUsers || 0,
        active_users: userStats.activeUsers || 0,
        new_users_30_days: userStats.newUsers30Days || 0,
        avg_score: userStats.avgScore || 0,
        max_score: userStats.maxScore || 0
      },
      questions: {
        total_questions: questionStats.totalQuestions || 0,
        active_questions: questionStats.activeQuestions || 0,
        categories_count: questionStats.categoriesCount || 0,
        avg_difficulty: questionStats.avgDifficulty || 0
      },
      quizzes: {
        total_quizzes: quizStats.totalQuizzes || 0,
        sent_quizzes: quizStats.sentQuizzes || 0,
        quizzes_last_30_days: quizStats.quizzesLast30Days || 0
      },
      attempts: {
        total_attempts: attemptStats.totalAttempts || 0,
        completed_attempts: attemptStats.completedAttempts || 0,
        avg_score: attemptStats.avgScore || 0,
        attempts_today: attemptStats.attemptsToday || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const mongoose = require('mongoose');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await UserQuizAttempt.aggregate([
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

    const agg = stats[0] || { total_attempts: 0, completed_attempts: 0, avg_score: 0, last_quiz_date: null };

    res.json({
      userStats: {
        first_name: user.firstName,
        last_name: user.lastName,
        city: user.city,
        position: user.position,
        total_score: user.totalScore,
        tests_completed: user.testsCompleted,
        registration_date: user.registrationDate,
        total_attempts: agg.total_attempts,
        completed_attempts: agg.completed_attempts,
        avg_score: agg.avg_score || 0,
        last_quiz_date: agg.last_quiz_date || null
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reports
const exportUsersReport = async (req, res) => {
  try {
    const users = await User.getAll(1000, 0); // Get all users
    
    const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
      'ID': user.id,
      'First Name': user.first_name,
      'Last Name': user.last_name,
      'City': user.city,
      'Position': user.position,

      'Phone': user.phone,
      'Total Score': user.total_score,
      'Tests Completed': user.tests_completed,
      'Registration Date': user.registration_date,
      'Last Login': user.last_login,
      'Is Active': user.is_active
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users_report.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Export users report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const exportQuizReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let sql = `
      SELECT 
        dq.quiz_date,
        dq.questions,
        COUNT(uqa.id) as total_attempts,
        COUNT(CASE WHEN uqa.is_completed = true THEN 1 END) as completed_attempts,
        AVG(CASE WHEN uqa.is_completed = true THEN uqa.score END) as avg_score
      FROM daily_quizzes dq
      LEFT JOIN user_quiz_attempts uqa ON dq.id = uqa.quiz_id
    `;
    
    const params = [];
    if (startDate && endDate) {
      sql += ' WHERE dq.quiz_date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }
    
    sql += ' GROUP BY dq.id, dq.quiz_date, dq.questions ORDER BY dq.quiz_date DESC';
    
    const result = await query(sql, params);
    
    const worksheet = XLSX.utils.json_to_sheet(result.rows.map(row => ({
      'Quiz Date': row.quiz_date,
      'Questions Count': row.questions ? Object.keys(row.questions).length : 0,
      'Total Attempts': row.total_attempts,
      'Completed Attempts': row.completed_attempts,
      'Average Score': Math.round(row.avg_score || 0)
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Report');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=quiz_report.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Export quiz report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Player Statistics Functions
const getPlayerStats = async (req, res) => {
  try {
    const { period = 'all', category = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Build date filter based on period
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'hour':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Get player statistics with aggregation
    const playerStatsPipeline = [
      {
        $match: {
          isActive: true,
          isAdmin: false,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'userquizattempts',
          localField: '_id',
          foreignField: 'userId',
          as: 'attempts'
        }
      },
      {
        $addFields: {
          totalScore: { $sum: '$attempts.score' },
          quizzesCompleted: { $size: '$attempts' },
          averageScore: { $avg: '$attempts.score' },
          lastQuizDate: { $max: '$attempts.completedAt' }
        }
      },
      {
        $sort: { totalScore: -1, quizzesCompleted: -1 }
      },
      {
        $skip: parseInt(offset)
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 1,
          full_name: { $concat: ['$firstName', ' ', '$lastName'] },
          city: 1,
          position: 1,
          total_score: '$totalScore',
          quizzes_completed: '$quizzesCompleted',
          average_score: '$averageScore',
          last_quiz_date: '$lastQuizDate'
        }
      }
    ];

    const playerStats = await User.aggregate(playerStatsPipeline);

    // Add rank to each player
    playerStats.forEach((player, index) => {
      player.rank = offset + index + 1;
    });

    // Get total count for pagination
    const countPipeline = [
      {
        $match: {
          isActive: true,
          isAdmin: false,
          ...dateFilter
        }
      }
    ];
    
    const totalPlayers = await User.aggregate([
      ...countPipeline,
      { $count: 'total' }
    ]);

    const totalCount = totalPlayers.length > 0 ? totalPlayers[0].total : 0;

    // Get summary statistics
    const summaryPipeline = [
      {
        $match: {
          isActive: true,
          isAdmin: false,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'userquizattempts',
          localField: '_id',
          foreignField: 'userId',
          as: 'attempts'
        }
      },
      {
        $group: {
          _id: null,
          activePlayers: { $sum: 1 },
          avgScoreAll: { $avg: { $avg: '$attempts.score' } },
          totalQuizzesCompleted: { $sum: { $size: '$attempts' } }
        }
      }
    ];

    const summaryResult = await User.aggregate(summaryPipeline);
    const summary = summaryResult.length > 0 ? summaryResult[0] : {
      activePlayers: 0,
      avgScoreAll: 0,
      totalQuizzesCompleted: 0
    };

    res.json({
      players: playerStats,
      summary: {
        activePlayers: summary.activePlayers,
        avgScoreAll: Math.round(summary.avgScoreAll || 0),
        totalQuizzesCompleted: summary.totalQuizzesCompleted,
        avgStreak: 0 // TODO: Implement streak calculation
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalPlayers: totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPlayerStatsCharts = async (req, res) => {
  try {
    const { period = 'all', category = 'all' } = req.query;

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'hour':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
    }

    // Score distribution chart data
    const scoreDistributionPipeline = [
      {
        $match: {
          isCompleted: true,
          ...dateFilter
        }
      },
      {
        $bucket: {
          groupBy: '$score',
          boundaries: [0, 60, 70, 80, 90, 100],
          default: '0-59',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ];

    const scoreDistribution = await UserQuizAttempt.aggregate(scoreDistributionPipeline);

    // Category activity chart data (simplified for now)
    const categoryActivityPipeline = [
      {
        $match: {
          isCompleted: true,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          quizCount: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      }
    ];

    const categoryActivity = await UserQuizAttempt.aggregate(categoryActivityPipeline);

    res.json({
      scoreDistribution: scoreDistribution.map(item => ({
        range: item._id,
        count: item.count
      })),
      categoryActivity: categoryActivity.length > 0 ? [{
        category: 'Всі категорії',
        quizCount: categoryActivity[0].quizCount,
        avgScore: Math.round(categoryActivity[0].avgScore)
      }] : []
    });
  } catch (error) {
    console.error('Get player stats charts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
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
};
