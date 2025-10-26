const { validationResult } = require('express-validator');
const { DailyQuiz, UserQuizAttempt, UserAnswer } = require('../models/Quiz');
const Question = require('../models/Question');
const Category = require('../models/Category');
const User = require('../models/User');
const emailService = require('../services/emailService');

const getTodayQuiz = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    // Get today's quiz
    let quiz = await DailyQuiz.findByDate(today);
    
    if (!quiz) {
      // Generate new quiz for today
      const categories = await Category.getAll();
      if (categories.length === 0) {
        return res.status(404).json({ error: 'No categories available' });
      }

      const categoryIds = categories.map(cat => cat.id);
      const questions = await Question.getRandomQuestions(categoryIds, 5);
      
      if (questions.length < 5) {
        return res.status(404).json({ error: 'Not enough questions available' });
      }

      quiz = await DailyQuiz.create({
        quizDate: today,
        questions: questions.map(q => ({
          id: q.id,
          questionText: q.question_text,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
          categoryName: q.category_name
        }))
      });
    }

    // Check if user already attempted today's quiz
    const existingAttempt = await UserQuizAttempt.findByUserAndQuiz(userId, quiz.id);
    
    if (existingAttempt && existingAttempt.is_completed) {
      return res.json({
        message: 'Quiz already completed',
        quiz: {
          id: quiz.id,
          date: quiz.quiz_date,
          questions: quiz.questions,
          isCompleted: true,
          score: existingAttempt.score
        }
      });
    }

    res.json({
      quiz: {
        id: quiz.id,
        date: quiz.quiz_date,
        questions: quiz.questions,
        isCompleted: false
      }
    });
  } catch (error) {
    console.error('Get today quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { quizId, answers } = req.body;

    // Check if quiz exists and is today's quiz
    const quiz = await DailyQuiz.findByDate(new Date().toISOString().split('T')[0]);
    if (!quiz || quiz.id !== quizId) {
      return res.status(400).json({ error: 'Invalid quiz or quiz not available' });
    }

    // Check if user already attempted this quiz
    let attempt = await UserQuizAttempt.findByUserAndQuiz(userId, quizId);
    
    if (attempt && attempt.is_completed) {
      return res.status(400).json({ error: 'Quiz already completed' });
    }

    // Check if it's still within deadline (before 00:00)
    const now = new Date();
    const deadline = new Date();
    deadline.setHours(0, 0, 0, 0);
    deadline.setDate(deadline.getDate() + 1); // Next day 00:00

    if (now >= deadline) {
      return res.status(400).json({ error: 'Quiz deadline has passed' });
    }

    // Create or update attempt
    if (!attempt) {
      attempt = await UserQuizAttempt.create({
        userId,
        quizId,
        answers
      });
    }

    // Calculate detailed statistics using new scoring system
    const quizQuestions = quiz.questions;
    const stats = UserQuizAttempt.calculateQuizStats(answers, quizQuestions);
    
    // Save individual answers with detailed information
    for (const detailedAnswer of stats.detailedAnswers) {
      await UserAnswer.create({
        attemptId: attempt.id,
        questionId: detailedAnswer.questionId,
        userAnswer: detailedAnswer.selectedAnswer,
        isCorrect: detailedAnswer.isCorrect,
        timeSpent: detailedAnswer.timeSpent
      });
    }

    // Complete the attempt with detailed statistics
    await UserQuizAttempt.completeAttempt(
      attempt.id, 
      stats.score, 
      stats.totalPoints, 
      stats.correctAnswers, 
      stats.incorrectAnswers, 
      stats.accuracy,
      answers.reduce((total, answer) => total + (answer.timeSpent || 0), 0)
    );

    // Update user's total score (using totalPoints instead of simple score)
    await User.updateScore(userId, stats.totalPoints);



    res.json({
      message: 'Quiz submitted successfully',
      result: {
        score: stats.score,
        totalPoints: stats.totalPoints,
        correctAnswers: stats.correctAnswers,
        incorrectAnswers: stats.incorrectAnswers,
        accuracy: stats.accuracy,
        totalQuestions: answers.length,
        detailedAnswers: stats.detailedAnswers
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getQuizResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { quizId } = req.params;

    const attempt = await UserQuizAttempt.findByUserAndQuiz(userId, quizId);
    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    const answers = await UserAnswer.getAttemptAnswers(attempt.id);

    res.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        accuracy: attempt.accuracy,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt,
        isCompleted: attempt.isCompleted
      },
      answers: answers.map(answer => ({
        questionId: answer.question_id,
        questionText: answer.question_text,
        options: {
          A: answer.option_a,
          B: answer.option_b,
          C: answer.option_c,
          D: answer.option_d
        },
        userAnswer: answer.user_answer,
        correctAnswer: answer.correct_answer,
        isCorrect: answer.is_correct,
        timeSpent: answer.time_spent,
        explanation: answer.explanation,
        categoryName: answer.category_name
      }))
    });
  } catch (error) {
    console.error('Get quiz result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const attempts = await UserQuizAttempt.getUserAttempts(userId, limit);

    res.json({
      attempts: attempts.map(attempt => ({
        id: attempt.id,
        quizDate: attempt.quiz_date,
        score: attempt.score,
        completedAt: attempt.completed_at,
        isCompleted: attempt.is_completed,
        questionsCount: attempt.questions ? Object.keys(attempt.questions).length : 0
      }))
    });
  } catch (error) {
    console.error('Get user quiz history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await User.getLeaderboard(limit);

    res.json({
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        firstName: user.first_name,
        lastName: user.last_name,
        city: user.city,
        position: user.position,
        totalScore: user.total_score,
        testsCompleted: user.tests_completed
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTodayQuiz,
  submitQuiz,
  getQuizResult,
  getUserQuizHistory,
  getLeaderboard
};
