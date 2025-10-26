const cron = require('node-cron');
const { DailyQuiz, UserQuizAttempt } = require('../models/Quiz');
const Question = require('../models/Question');
const Category = require('../models/Category');
const User = require('../models/User');
const emailService = require('./emailService');

const generateDailyQuiz = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if quiz already exists for today
    const existingQuiz = await DailyQuiz.findByDate(today);
    if (existingQuiz) {
      console.log(`Quiz for ${today} already exists`);
      return;
    }

    // Get all active categories
    const categories = await Category.getAll();
    if (categories.length === 0) {
      console.log('No categories available for quiz generation');
      return;
    }

    // Get random questions from different categories
    const categoryIds = categories.map(cat => cat.id);
    const questions = await Question.getRandomQuestions(categoryIds, 5);
    
    if (questions.length < 5) {
      console.log('Not enough questions available for quiz generation');
      return;
    }

    // Create daily quiz
    const quiz = await DailyQuiz.createQuiz({
      quizDate: new Date(today),
      questions: questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        categoryName: q.categoryName
      }))
    });

    console.log(`Daily quiz created for ${today} with ${questions.length} questions`);
    
    // Send notifications to all active users
    await sendQuizNotifications(quiz);
    
    // Mark quiz as sent
    await DailyQuiz.markAsSent(quiz._id);
    
    return quiz;
  } catch (error) {
    console.error('Error generating daily quiz:', error);
  }
};

const sendQuizNotifications = async (quiz) => {
  try {
    console.log('Email notifications disabled - email field removed from user model');
    return;
    
  } catch (error) {
    console.error('Error sending quiz notifications:', error);
  }
};

const sendQuizReminders = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const quiz = await DailyQuiz.findByDate(today);
    
    if (!quiz) {
      console.log('No quiz found for today');
      return;
    }

    // Calculate hours left until deadline
    const now = new Date();
    const deadline = new Date();
    deadline.setHours(0, 0, 0, 0);
    deadline.setDate(deadline.getDate() + 1); // Next day 00:00
    
    const hoursLeft = Math.ceil((deadline - now) / (1000 * 60 * 60));

    // Get users who haven't completed today's quiz
    const users = await User.aggregate([
      {
        $match: {
          isActive: true,
          email: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: 'userquizattempts',
          let: { userId: '$_id', quizId: quiz._id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$quizId', '$$quizId'] }
                  ]
                }
              }
            }
          ],
          as: 'attempts'
        }
      },
      {
        $match: {
          $or: [
            { attempts: { $size: 0 } },
            { 'attempts.isCompleted': false }
          ]
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1
        }
      }
    ]);

    console.log('Email reminders disabled - email field removed from user model');
    return;
    
  } catch (error) {
    console.error('Error sending quiz reminders:', error);
  }
};

const cleanupExpiredAttempts = async () => {
  try {
    // Find attempts that were not completed before deadline
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const result = await UserQuizAttempt.updateMany(
      {
        isCompleted: false,
        createdAt: { $lt: yesterday },
        completedAt: null
      },
      {
        $set: {
          isCompleted: false,
          score: 0
        }
      }
    );

    console.log(`Cleaned up ${result.modifiedCount} expired quiz attempts`);
  } catch (error) {
    console.error('Error cleaning up expired attempts:', error);
  }
};

const startScheduler = () => {
  // Generate daily quiz at 12:00 PM
  cron.schedule('0 12 * * *', () => {
    console.log('Starting daily quiz generation...');
    generateDailyQuiz();
  });

  // Send reminders every 2 hours starting from 2 PM
  cron.schedule('0 14,16,18,20,22 * * *', () => {
    console.log('Sending quiz reminders...');
    sendQuizReminders();
  });

  // Cleanup expired attempts at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('Cleaning up expired attempts...');
    cleanupExpiredAttempts();
  });

  console.log('Quiz scheduler started');
  console.log('- Daily quiz generation: 12:00 PM');
  console.log('- Quiz reminders: 2:00, 4:00, 6:00, 8:00, 10:00 PM');
  console.log('- Cleanup expired attempts: 12:00 AM');
};

module.exports = {
  generateDailyQuiz,
  sendQuizReminders,
  cleanupExpiredAttempts,
  startScheduler
};
