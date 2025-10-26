const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const Question = require('../models/Question');
const Category = require('../models/Category');

// Get quizzes by category (generates quizzes from questions)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Category parameter is required' });
    }

    // Find the category by name
    const categoryDoc = await Category.findByName(category);
    if (!categoryDoc) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get questions for this category
    const questions = await Question.getAll({
      categoryId: categoryDoc.id,
      isActive: true,
      limit: 100 // Get more questions to create multiple quizzes
    });

    if (questions.length === 0) {
      return res.json({ quizzes: [] });
    }

    // Generate quizzes from questions (group questions into quizzes of 5-10 questions each)
    const quizzes = [];
    const questionsPerQuiz = 5;
    const maxQuizzes = Math.min(5, Math.ceil(questions.length / questionsPerQuiz)); // Max 5 quizzes

    for (let i = 0; i < maxQuizzes; i++) {
      const startIndex = i * questionsPerQuiz;
      const endIndex = Math.min(startIndex + questionsPerQuiz, questions.length);
      const quizQuestions = questions.slice(startIndex, endIndex);

      if (quizQuestions.length > 0) {
        const quiz = {
          id: `${categoryDoc.id}_quiz_${i + 1}`,
          title: `${categoryDoc.name} - Квіз ${i + 1}`,
          description: `Тест з ${quizQuestions.length} питань по категорії "${categoryDoc.name}"`,
          category: categoryDoc.name,
          categoryId: categoryDoc.id,
          questionsCount: quizQuestions.length,
          difficulty: 'medium',
          estimatedTime: quizQuestions.length * 30, // 30 seconds per question
          createdAt: new Date().toISOString()
        };
        quizzes.push(quiz);
      }
    }

    res.json({ quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific quiz by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse quiz ID to extract category and quiz number
    const idParts = id.split('_');
    if (idParts.length !== 3 || idParts[1] !== 'quiz') {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }

    const categoryId = idParts[0]; // Keep as string (ObjectId)
    const quizNumber = parseInt(idParts[2]);

    // Get category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get questions for this category
    const allQuestions = await Question.getAll({
      categoryId: categoryId,
      isActive: true,
      limit: 100
    });

    const questionsPerQuiz = 5;
    const startIndex = (quizNumber - 1) * questionsPerQuiz;
    const endIndex = Math.min(startIndex + questionsPerQuiz, allQuestions.length);
    const quizQuestions = allQuestions.slice(startIndex, endIndex);

    if (quizQuestions.length === 0) {
      return res.status(404).json({ error: 'Quiz not found or no questions available' });
    }

    const quiz = {
      id: id,
      title: `${category.name} - Квіз ${quizNumber}`,
      description: `Тест з ${quizQuestions.length} питань по категорії "${category.name}"`,
      category: category.name,
      categoryId: category.id,
      questionsCount: quizQuestions.length,
      difficulty: 'medium',
      estimatedTime: quizQuestions.length * 30,
      createdAt: new Date().toISOString()
    };

    res.json({ quiz });
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get questions for a specific quiz
router.get('/:id/questions', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse quiz ID to extract category and quiz number
    const idParts = id.split('_');
    if (idParts.length !== 3 || idParts[1] !== 'quiz') {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }

    const categoryId = idParts[0]; // Keep as string (ObjectId)
    const quizNumber = parseInt(idParts[2]);

    // Get questions for this category
    const allQuestions = await Question.getAll({
      categoryId: categoryId,
      isActive: true,
      limit: 100
    });

    const questionsPerQuiz = 5;
    const startIndex = (quizNumber - 1) * questionsPerQuiz;
    const endIndex = Math.min(startIndex + questionsPerQuiz, allQuestions.length);
    const questions = allQuestions.slice(startIndex, endIndex);

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this quiz' });
    }

    res.json({ questions });
  } catch (error) {
    console.error('Get quiz questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit quiz result
router.post('/results', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { quiz_id, score, total_questions, time_taken } = req.body;

    // Validate required fields
    if (!quiz_id || score === undefined || !total_questions || !time_taken) {
      return res.status(400).json({ 
        error: 'Missing required fields: quiz_id, score, total_questions, time_taken' 
      });
    }

    // For now, we'll create a simple result object
    // In a real application, you might want to save this to a database
    const result = {
      id: Date.now(), // Simple ID generation
      userId: userId,
      quizId: quiz_id,
      score: score,
      totalQuestions: total_questions,
      timeTaken: time_taken,
      percentage: Math.round((score / total_questions) * 100),
      completedAt: new Date().toISOString()
    };

    console.log('Quiz result submitted:', result);

    res.status(201).json({
      message: 'Quiz result submitted successfully',
      result: result
    });
  } catch (error) {
    console.error('Submit quiz result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;