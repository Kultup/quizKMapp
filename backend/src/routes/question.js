const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const Question = require('../models/Question');

// Get all active questions (for knowledge base)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { categoryId, limit = 20, offset = 0 } = req.query;
    
    const filters = {
      isActive: true,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (categoryId) {
      filters.categoryId = parseInt(categoryId);
    }

    const questions = await Question.getAll(filters);
    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific question with explanation
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(parseInt(id));

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
